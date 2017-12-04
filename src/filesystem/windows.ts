import { POSIX } from './posix';

export class Windows extends POSIX {
    protected systemPaths: string[] = (process.env.PATH as string)
        .split(/;/g)
        .map((path: string) => path.replace(/(;)$/, '').trim());
    protected extensions = ['.bat', '.exe', '.cmd', ''];
    protected separator: string = '\\';
}
