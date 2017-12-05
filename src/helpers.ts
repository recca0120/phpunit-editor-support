import { statSync } from 'fs';

export const parseSentence = require('minimist-string');

export function isWindows(): boolean {
    return /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
}

export function tap(val: any, callback: Function): any {
    callback(val);

    return val;
}

export function existsSync(filePath: string) {
    try {
        statSync(filePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
    }

    return true;
}

export function ensureArray(search: string[] | string): string[] {
    return search instanceof Array ? search : [search];
}
