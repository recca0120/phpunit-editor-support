import { ChildProcess, SpawnOptions, spawn } from 'child_process';

import { EventEmitter } from 'events';
import { tap } from '../helpers';

export class Process {
    constructor(private dispatcher: EventEmitter = new EventEmitter()) {}

    spawn(parameters: string[], options?: SpawnOptions): Promise<string> {
        return new Promise(resolve => {
            const command: string = parameters.shift() || '';
            const output: Buffer[] = [];

            return tap(spawn(command, parameters, options), (process: ChildProcess) => {
                process.stdout.on('data', (buffer: Buffer) => {
                    output.push(buffer);
                    this.dispatcher.emit('stdout', buffer);
                });

                process.stderr.on('data', (buffer: Buffer) => {
                    this.dispatcher.emit('stderr', buffer);
                });

                process.on('exit', code => {
                    this.dispatcher.emit('exit', code);
                    resolve(
                        output
                            .map(buffer => buffer.toString())
                            .join('')
                            .replace(/\n$/, '')
                    );
                });
            });
        });
    }

    on(name: string | symbol, callback: any): Process {
        this.dispatcher.on(name, callback);

        return this;
    }
}
