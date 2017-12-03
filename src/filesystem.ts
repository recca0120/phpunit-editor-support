import { dirname, parse as pathParse, resolve as pathResolve } from 'path';
import { isWindows, tap } from './helpers';
import { readFile, readFileSync, statSync, unlinkSync } from 'fs';

import { tmpdir } from 'os';

function existsSync(filePath: string) {
    try {
        statSync(filePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
    }

    return true;
}

function ensureArray(search: string[] | string): string[] {
    return search instanceof Array ? search : [search];
}

export interface FilesOptions {
    cwd?: string;
    rootPath?: string;
}

export interface Files {
    find(search: string[] | string, opts?: {}): string;
    exists(search: string[] | string, opts?: {}): boolean;
    findUp(search: string[] | string, opts?: {}): string;
}

export class POSIX implements Files {
    protected systemPaths: string[] = (process.env.PATH as string)
        .split(/:|;/g)
        .map((path: string) => path.replace(/(:|;)$/, '').trim());
    protected extensions = [''];
    protected separator: string = '/';

    findUp(search: string[] | string, opts?: FilesOptions): string {
        let { cwd } = Object.assign(
            {
                cwd: process.cwd(),
            },
            opts
        );

        const root = pathParse(cwd).root;
        // const basePath = opts.basePath ? pathResolve(opts.basePath) : root;

        do {
            const find = this.usePath(search, {
                cwd: cwd,
            });

            if (find) {
                return find;
            }

            cwd = pathResolve(cwd, '..');
        } while (root !== cwd);

        return this.find(search, {
            cwd: root,
        });
    }

    find(search: string[] | string, opts?: FilesOptions): string {
        return this.usePath(search, opts) || this.useSystemPath(search);
    }

    exists(search: string[] | string, opts?: FilesOptions): boolean {
        search = ensureArray(search);

        const { cwd } = Object.assign(
            {
                cwd: process.cwd(),
            },
            opts
        );

        for (const file of search) {
            if (
                this.extensions.some(extension => existsSync(`${cwd}${this.separator}${file}${extension}`)) ||
                this.extensions.some(extension => existsSync(`${file}${extension}`))
            ) {
                return true;
            }
        }

        return false;
    }

    protected usePath(search: string[] | string, opts?: FilesOptions): string {
        search = ensureArray(search);

        const { cwd } = Object.assign(
            {
                cwd: process.cwd(),
            },
            opts
        );

        for (const file of search) {
            for (const pwd of [`${cwd}${this.separator}`, '']) {
                for (const extension of this.extensions) {
                    const path = `${pwd}${file}${extension}`;

                    if (existsSync(path) === true && this.isFile(path)) {
                        return pathResolve(path);
                    }
                }
            }
        }

        return '';
    }

    protected useSystemPath(search: string[] | string): string {
        search = ensureArray(search);

        for (const systemPath of this.systemPaths) {
            const find = this.usePath(search, {
                cwd: systemPath,
            });

            if (find) {
                return find;
            }
        }

        return '';
    }

    protected isFile(path: string): boolean {
        return statSync(path).isFile();
    }
}

export class Windows extends POSIX {
    protected systemPaths: string[] = (process.env.PATH as string)
        .split(/;/g)
        .map((path: string) => path.replace(/(;)$/, '').trim());
    protected extensions = ['.bat', '.exe', '.cmd', ''];
    protected separator: string = '\\';
}

export abstract class Cacheable {
    protected cache = new Map<string, string>();

    protected key(search: string[] | string, opts: string[] = []) {
        return JSON.stringify(
            ensureArray(search)
                .concat(opts)
                .join('-')
        );
    }
}

export class Filesystem extends Cacheable {
    constructor(private files = isWindows() ? new Windows() : new POSIX()) {
        super();
    }

    findUp(search: string[] | string, opts: any = {}): string {
        const cwd = opts.cwd || process.cwd();
        const rootPath = opts.rootPath || '';
        const key = this.key(search, [cwd, rootPath]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.findUp(search, opts), (find: string) => this.cache.set(key, find));
    }

    find(search: string[] | string, opts: any = {}): string {
        const cwd = opts.cwd || process.cwd();
        const key = this.key(search, [cwd]);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.find(search, opts), (find: string) => this.cache.set(key, find));
    }

    exists(search: string[] | string, opts: any = {}): boolean {
        const cwd = opts.cwd || process.cwd();
        const key = this.key(search, [cwd, 'exists']);

        return this.cache.has(key) === true
            ? this.cache.get(key)
            : tap(this.files.exists(search, opts), (find: string) => this.cache.set(key, find));
    }

    get(path: string): string {
        return readFileSync(path).toString();
    }

    getAsync(path: string, encoding: string = 'utf8'): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(path, encoding, (error, data) => {
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

    tmpfile(tmpname: string, dir: string = ''): string {
        return pathResolve(!dir ? tmpdir() : dir, tmpname);
    }

    isFile(path: string): boolean {
        return statSync(path).isFile();
    }

    dirname(path: string): string {
        return dirname(path);
    }
}
