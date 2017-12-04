import { dirname, resolve as pathResolve } from 'path';
import { ensureArray, existsSync, isWindows, tap } from '../helpers';
import { readFile, readFileSync, statSync, unlinkSync } from 'fs';

import { FilesOptions } from './files-options';
import { POSIX } from './posix';
import { Windows } from './windows';
import { tmpdir } from 'os';

export class Filesystem {
    protected cache = new Map<string, string>();

    constructor(private files = isWindows() ? new Windows() : new POSIX()) {}

    find(search: string[] | string, opts: FilesOptions = {}): string {
        const cwd = opts.cwd || process.cwd();
        const key = this.key(search, [cwd]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.find(search, opts), (find: string) => this.cache.set(key, find));
    }

    exists(search: string[] | string, opts: FilesOptions = {}): boolean {
        const cwd = opts.cwd || process.cwd();
        const key = this.key(search, [cwd, 'exists']);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.exists(search, opts), (find: string) => this.cache.set(key, find));
    }

    findUp(search: string[] | string, opts: FilesOptions = {}): string {
        const cwd = opts.cwd || process.cwd();
        const rootPath = opts.rootPath || '';
        const key = this.key(search, [cwd, rootPath]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.findUp(search, opts), (find: string) => this.cache.set(key, find));
    }

    get(path: string): string {
        return readFileSync(path).toString();
    }

    getAsync(path: string, encoding: string = 'utf8'): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(path, encoding, (error: any, data: any) => {
                return error ? reject(error) : resolve(data);
            });
        });
    }

    unlink(file: string): void {
        try {
            if (existsSync(file) === true) {
                unlinkSync(file);
            }
        } catch (e) {
            setTimeout(() => {
                this.unlink(file);
            }, 500);
        }
    }

    tmpfile(tmpname: string, dir: string = tmpdir()): string {
        return pathResolve(dir, tmpname);
    }

    type(path: string): string {
        return statSync(path).isFile() ? 'f' : 'd';
    }

    dirname(path: string): string {
        return dirname(path);
    }

    private key(search: string[] | string, opts: string[] = []) {
        return JSON.stringify(
            ensureArray(search)
                .concat(opts)
                .join('-')
        );
    }
}
