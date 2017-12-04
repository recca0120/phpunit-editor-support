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
