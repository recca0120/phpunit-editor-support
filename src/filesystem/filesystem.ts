import { dirname, resolve as pathResolve } from 'path';
import { ensureArray, existsSync, isWindows, tap } from '../helpers';
import { readFile, readFileSync, statSync, unlinkSync } from 'fs';

import { FilesOptions } from './files-options';
import { POSIX } from './posix';
import { Windows } from './windows';
import { tmpdir } from 'os';

export class FilesystemBase {
    constructor(protected files = isWindows() ? new Windows() : new POSIX()) {}

    find(search: string[] | string, opts: FilesOptions = {}): string {
        return this.files.find(search, opts);
    }

    exists(search: string[] | string, opts: FilesOptions = {}): boolean {
        return this.files.exists(search, opts)
    }

    findUp(search: string[] | string, opts: FilesOptions = {}): string {
        return this.files.findUp(search, opts)
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

    unlink(file: string): boolean {
        try {
            if (existsSync(file) === true) {
                unlinkSync(file);

                return true;
            }
        } catch (error) {
            console.error(error);
        }

        return false;
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
}


export class Filesystem extends FilesystemBase {
    protected cache = new Map<string, string>();

    constructor(protected files = isWindows() ? new Windows() : new POSIX()) {
        super(files);
    }

    find(search: string[] | string, opts: FilesOptions = {}): string {
        const cwd = opts.cwd || process.cwd();
        const key = this.key(search, [cwd]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(super.find(search, opts), (find: string) => this.cache.set(key, find));
    }

    exists(search: string[] | string, opts: FilesOptions = {}): boolean {
        const cwd = opts.cwd || process.cwd();
        const key = this.key(search, [cwd, 'exists']);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(super.exists(search, opts), (find: string) => this.cache.set(key, find));
    }

    findUp(search: string[] | string, opts: FilesOptions = {}): string {
        const cwd = opts.cwd || process.cwd();
        const rootPath = opts.rootPath || '';
        const key = this.key(search, [cwd, rootPath]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(super.findUp(search, opts), (find: string) => this.cache.set(key, find));
    }

    private key(search: string[] | string, opts: string[] = []): string {
        return JSON.stringify(
            ensureArray(search)
                .concat(opts)
                .join('-')
        );
    }
}
