import { EventEmitter } from 'events';
import { Filesystem } from '../filesystem';
import { ParserFactory } from '../parser-factory';
import { ProcessFactory } from '../process-factory';
import { RunnerOptions } from './runner-options';
import { RunnerParams } from './runner-params';
import { State } from './state';
import { TestCase } from '../parsers';
import { tap } from '../../src/helpers';

export class Runner {
    constructor(
        private files: Filesystem = new Filesystem(),
        private processFactory: ProcessFactory = new ProcessFactory(),
        private parserFactory: ParserFactory = new ParserFactory(),
        private dispatcher: EventEmitter = new EventEmitter()
    ) {}

    run(path: string, params: string[] = [], opts: RunnerOptions = {}): Promise<TestCase[]> {
        opts.rootPath = opts.rootPath || __dirname;

        const cwd: string = this.files.type(path) === 'f' ? this.files.dirname(path) : path;
        const runnerParams = new RunnerParams(params);

        return new Promise((resolve, reject) => {
            if (runnerParams.has('--teamcity') === false) {
                runnerParams.put('--log-junit', this.files.tmpfile(`vscode-phpunit-junit-${new Date().getTime()}.xml`));
            }

            if (runnerParams.has('-c') === false) {
                runnerParams.put('-c', this.getConfiguration(cwd, opts) || false);
            }

            const spawnOptions = this.getExecutable(cwd, opts)
                .concat(runnerParams.toParams())
                .concat([path]);

            this.dispatcher.emit('start', spawnOptions.join(' '));

            try {
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
            } catch (error) {
                console.error(error);
                throw State.PHPUNIT_NOT_FOUND;
            }
        });
    }

    on(name: string | symbol, callback: any): Runner {
        this.dispatcher.on(name, callback);

        return this;
    }

    public getConfiguration(cwd: string, opts: RunnerOptions): string {
        return this.files.findUp(['phpunit.xml', 'phpunit.xml.dist'], { cwd, rootPath: opts.rootPath });
    }

    public getExecutable(cwd: string, opts: RunnerOptions): string[] {
        if (opts.execPath instanceof Array) {
            return opts.execPath;
        }

        const execPath: string = (opts.execPath || '').trim();

        if (['', 'phpunit'].indexOf(execPath) === -1) {
            return [execPath];
        }

        const options: any = {
            cwd,
            rootPath: opts.rootPath,
        };

        return tap(
            [this.files.findUp(['vendor/bin/phpunit', 'phpunit.phar', 'phpunit'], options)].filter(
                (cmd: string) => cmd !== ''
            ),
            (commands: string[]) => {
                if (commands.length === 0) {
                    throw State.PHPUNIT_NOT_FOUND;
                }
            }
        );
    }
}
