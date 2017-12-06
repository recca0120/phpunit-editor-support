import { EventEmitter } from 'events';
import { Filesystem } from '../filesystem';
import { PHPUnitOptions } from './phpunit-options';
import { PHPUnitParams } from './phpunit-params';
import { ParserFactory } from '../parsers';
import { ProcessFactory } from '../process';
import { State } from './state';
import { TestCase } from '../parsers';
import { dirname } from 'path';
import { tap } from '../helpers';

export class PHPUnit {
    constructor(
        private files: Filesystem = new Filesystem(),
        private processFactory: ProcessFactory = new ProcessFactory(),
        private parserFactory: ParserFactory = new ParserFactory(),
        private dispatcher: EventEmitter = new EventEmitter()
    ) {}

    run(path: string, params: string[] = [], opts: PHPUnitOptions = {}): Promise<TestCase[]> {
        opts.rootPath = opts.rootPath || __dirname;

        const cwd: string = this.files.type(path) === 'f' ? this.files.dirname(path) : path;
        const phpunitParms = new PHPUnitParams(params);

        return new Promise((resolve, reject) => {
            const commands: string[] = this.getExecutable(cwd, opts);

            if (phpunitParms.has('--teamcity') === false) {
                phpunitParms.put('--log-junit', this.files.tmpfile(`vscode-phpunit-junit-${new Date().getTime()}.xml`));
            }

            if (phpunitParms.has('-c') === false) {
                tap(
                    commands.find((command: string) => command.indexOf('phpunit') !== -1),
                    (find: string | undefined) => {
                        phpunitParms.put('-c', this.getConfiguration(find ? dirname(find) : cwd, opts) || false);
                    }
                );
            }

            const spawnOptions = commands.concat(phpunitParms.toParams()).concat([path]);

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
                        const parser = this.parserFactory.create(phpunitParms.has('--teamcity') ? 'teamcity' : 'junit');
                        const content = phpunitParms.has('--teamcity') ? output : phpunitParms.get('--log-junit');
                        parser
                            .parse(content)
                            .then((tests: TestCase[]) => {
                                if (phpunitParms.has('--log-junit')) {
                                    this.files.unlink(phpunitParms.get('--log-junit'));
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

    on(name: string | symbol, callback: any): PHPUnit {
        this.dispatcher.on(name, callback);

        return this;
    }

    public getConfiguration(cwd: string, opts: PHPUnitOptions): string {
        return this.files.findUp(['phpunit.xml', 'phpunit.xml.dist'], { cwd, rootPath: opts.rootPath });
    }

    public getExecutable(cwd: string, opts: PHPUnitOptions): string[] {
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
