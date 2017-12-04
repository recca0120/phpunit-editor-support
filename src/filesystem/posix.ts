import { ensureArray, existsSync } from '../helpers';
import { parse as pathParse, resolve as pathResolve } from 'path';

import { Files } from './files';
import { FilesOptions } from './files-options';
import { statSync } from 'fs';

export class POSIX implements Files {
    protected systemPaths: string[] = (process.env.PATH as string)
        .split(/:|;/g)
        .map((path: string) => path.replace(/(:|;)$/, '').trim());
    protected extensions = [''];
    protected separator: string = '/';

    find(search: string[] | string, opts: FilesOptions = {}): string {
        return this.usePath(search, opts) || this.useSystemPath(search, opts);
    }

    exists(search: string[] | string, opts: FilesOptions = {}): boolean {
        const cwd: string = opts.cwd || process.cwd();

        search = ensureArray(search);

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

    findUp(search: string[] | string, opts: FilesOptions = {}): string {
        let cwd: string = opts.cwd || process.cwd();

        const root = pathParse(cwd).root;

        do {
            const find = this.usePath(
                search,
                Object.assign(opts, {
                    cwd: cwd,
                })
            );

            if (find) {
                return find;
            }

            cwd = pathResolve(cwd, '..');
        } while (root !== cwd);

        return this.find(
            search,
            Object.assign(opts, {
                cwd: root,
            })
        );
    }

    protected usePath(search: string[] | string, opts: FilesOptions = {}): string {
        const cwd: string = opts.cwd || process.cwd();

        search = ensureArray(search);

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

    protected useSystemPath(search: string[] | string, opts: FilesOptions = {}): string {
        const systemPaths: string[] = opts.systemPaths || this.systemPaths;

        search = ensureArray(search);

        for (const systemPath of systemPaths) {
            const find = this.usePath(
                search,
                Object.assign(opts, {
                    cwd: systemPath,
                })
            );

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
