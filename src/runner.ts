import { EventEmitter } from 'events';
import { Filesystem } from './filesystem';
import { ParserFactory } from './parsers';
import { ProcessFactory } from './process';
import { TestCase } from './parsers';
import { dirname } from 'path';
import { tap } from './helpers';

const minimist = require('minimist');

export enum State {
    PHPUNIT_GIT_FILE = 'phpunit_git_file',
    PHPUNIT_NOT_FOUND = 'phpunit_not_found',
    PHPUNIT_EXECUTE_ERROR = 'phpunit_execute_error',
    PHPUNIT_NOT_TESTCASE = 'phpunit_not_testcase',
    PHPUNIT_NOT_PHP = 'phpunit_not_php',
}

export interface RunnerOptions {
    rootPath?: string;
    execPath?: string;
}

export class RunnerParams {
    private options: any;

    constructor(options: string[] = []) {
        this.options = this.parseOptions(options);
    }

    has(key: string) {
        return !!this.options[this.normalizeKey(key)];
    }

    put(key: string, value: any) {
        this.options[this.normalizeKey(key)] = value;

        return this;
    }

    get(key: string) {
        return this.options[this.normalizeKey(key)];
    }

    remove(key: string) {
        delete this.options[this.normalizeKey(key)];
    }

    toParams() {
        return tap(Object.keys(this.options).filter(key => key !== '_'), (keys: string[]) => {
            keys.sort();
        }).reduce((prev: string[], key: string) => {
            const k = key.length === 1 ? `-${key}` : `--${key}`;
            let value = this.get(key);

            if (['d', 'include-path'].indexOf(key) === -1 && value instanceof Array) {
                value = value[value.length - 1];
            }

            if (key === 'colors') {
                return prev.concat(`--colors=${value}`);
            }

            if (value === true) {
                return prev.concat([k]);
            }

            if (!value) {
                return prev;
            }

            return value instanceof Array
                ? value.reduce((opts, v) => {
                      return opts.concat([k, v]);
                  }, prev)
                : prev.concat([k, value]);
        }, this.options._);
    }

    private normalizeKey(key: string) {
        return key.replace(/^-+/g, '');
    }

    private parseOptions(opts: string[]) {
        return tap(
            minimist(opts, {
                boolean: ['teamcity'],
            }),
            (options: any) => {
                options['log-junit'] = false;
                if (options['c'] || options['configuration']) {
                    options['c'] = options['c'] || options['configuration'];
                    options['configuration'] = false;
                }
            }
        );
    }
}

export class Runner {
    constructor(
        private parserFactory: ParserFactory = new ParserFactory(),
        private processFactory: ProcessFactory = new ProcessFactory(),
        private files: Filesystem = new Filesystem(),
        private dispatcher: EventEmitter = new EventEmitter()
    ) {}

    run(path: string, params: string[], opts: RunnerOptions): Promise<TestCase[]> {
        const { rootPath, execPath } = Object.assign(
            {
                rootPath: __dirname,
                execPath: '',
            },
            opts
        );

        const cwd: string = this.files.isFile(path) ? this.files.dirname(path) : path;
        const runnerParams = new RunnerParams(params);

        return new Promise((resolve, reject) => {
            if (runnerParams.has('--teamcity') === false) {
                runnerParams.put('--log-junit', this.files.tmpfile(`vscode-phpunit-junit-${new Date().getTime()}.xml`));
            }

            const executable: string = this.getExecutable(execPath, cwd, rootPath);

            if (runnerParams.has('-c') === false) {
                runnerParams.put('-c', this.getConfiguration(dirname(executable), rootPath) || false);
            }

            const spawnOptions = [executable].concat(runnerParams.toParams()).concat([path]);

            this.dispatcher.emit('start', spawnOptions.join(' '));

            this.processFactory
                .create()
                .on('stdout', (buffer: Buffer) => this.dispatcher.emit('stdout', buffer))
                .on('stderr', (buffer: Buffer) => this.dispatcher.emit('stderr', buffer))
                .spawn(spawnOptions, {
                    cwd: rootPath,
                })
                .then((output: string) => {
                    const parser = this.parserFactory.create(runnerParams.has('--teamcity') ? 'teamcity' : 'junit');
                    const content = runnerParams.has('--teamcity') ? output : runnerParams.get('--log-junit');
                    parser
                        .parse(content)
                        .then((items: TestCase[]) => {
                            if (runnerParams.has('--log-junit')) {
                                this.files.unlink(runnerParams.get('--log-junit'));
                            }
                            resolve(items);
                        })
                        .catch((error: string) => reject(error));

                    this.dispatcher.emit('exit', output);
                });
        });
    }

    on(name: string | symbol, callback: any): Runner {
        this.dispatcher.on(name, callback);

        return this;
    }

    private getConfiguration(cwd: string, rootPath: string): string {
        return this.files.findUp(['phpunit.xml', 'phpunit.xml.dist'], { cwd, rootPath });
    }

    private getExecutable(execPath: string, cwd: string, rootPath: string): string {
        const path: string = this.files.findUp(
            [execPath, `vendor/bin/phpunit`, `phpunit.phar`, 'phpunit'].filter(path => path !== ''),
            { cwd, rootPath }
        );

        if (!path) {
            throw State.PHPUNIT_NOT_FOUND;
        }

        return path;
    }
}
