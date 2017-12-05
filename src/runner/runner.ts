import { EventEmitter } from 'events';
import { Filesystem } from '../filesystem';
import { ParserFactory } from '../parser-factory';
import { ProcessFactory } from '../process-factory';
import { RunnerOptions } from './runner-options';
import { RunnerParams } from './runner-params';
import { State } from './state';
import { TestCase } from '../parsers';
import { dirname } from 'path';

export class Runner {
    constructor(
        private files: Filesystem = new Filesystem(),
        private processFactory: ProcessFactory = new ProcessFactory(),
        private parserFactory: ParserFactory = new ParserFactory(),
        private dispatcher: EventEmitter = new EventEmitter()
    ) {}

    run(path: string, params: string[] = [], opts: RunnerOptions = {}): Promise<TestCase[]> {
        opts = Object.assign(
            {
                rootPath: __dirname,
                execPath: '',
            },
            opts
        );

        const cwd: string = this.files.type(path) === 'f' ? this.files.dirname(path) : path;
        const runnerParams = new RunnerParams(params);

        return new Promise((resolve, reject) => {
            if (runnerParams.has('--teamcity') === false) {
                runnerParams.put('--log-junit', this.files.tmpfile(`vscode-phpunit-junit-${new Date().getTime()}.xml`));
            }

            if (runnerParams.has('-c') === false) {
                runnerParams.put('-c', this.getConfiguration(cwd, opts) || false);
            }

            const executable: string[] = this.getExecutable(cwd, opts);

            const spawnOptions = executable.concat(runnerParams.toParams()).concat([path]);

            this.dispatcher.emit('start', spawnOptions.join(' '));

            this.processFactory
                .create()
                .on('stdout', (buffer: Buffer) => this.dispatcher.emit('stdout', buffer))
                .on('stderr', (buffer: Buffer) => this.dispatcher.emit('stderr', buffer))
                .spawn(spawnOptions, {
                    cwd: opts.rootPath,
                })
                .then((output: string) => {
                    const parser = this.parserFactory.create(runnerParams.has('--teamcity') ? 'teamcity' : 'junit');
                    const content = runnerParams.has('--teamcity') ? output : runnerParams.get('--log-junit');
                    parser
                        .parse(content)
                        .then((tests: TestCase[]) => {
                            if (runnerParams.has('--log-junit')) {
                                this.files.unlink(runnerParams.get('--log-junit'));
                            }
                            resolve(tests);
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

    private getConfiguration(cwd: string, opts: RunnerOptions): string {
        return this.files.findUp(['phpunit.xml', 'phpunit.xml.dist'], { cwd, rootPath: opts.rootPath });
    }

    private getExecutable(cwd: string, opts: RunnerOptions): string[] {
        const execPath: string = opts.execPath as string;

        if (['', 'phpunit'].indexOf(execPath) !== -1) {
            return [execPath];
        }

        const path: string = this.files.findUp(
            ['vendor/bin/phpunit', 'phpunit.phar', 'phpunit'].filter(path => path !== ''),
            { cwd, rootPath: opts.rootPath }
        );

        if (!path) {
            throw State.PHPUNIT_NOT_FOUND;
        }

        return [path];
    }
}
