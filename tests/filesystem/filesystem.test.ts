import { Filesystem, POSIX } from '../../src/filesystem';

import { existsSync } from '../../src/helpers';
import { resolve as pathResolve } from 'path';
import { writeFileSync } from 'fs';

describe('Posix', () => {
    let posix: POSIX;
    let files: Filesystem;

    beforeEach(() => {
        posix = new POSIX();
        files = new Filesystem(posix);
    });

    it('find', () => {
        spyOn(posix, 'find').and.callThrough();

        expect(
            files.find('php', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/usr/bin/php'));

        expect(posix.find).toHaveBeenCalled();
    });

    it('find system path', () => {
        spyOn(posix, 'find').and.callThrough();

        expect(
            files.find('ls', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
                systemPaths: [pathResolve(__dirname, '../fixtures/bin')],
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/bin/ls'));

        expect(posix.find).toHaveBeenCalled();
    });

    it('exists', () => {
        spyOn(posix, 'exists').and.callThrough();

        expect(
            files.exists('php', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toBe(true);

        expect(posix.exists).toHaveBeenCalled();
    });

    it('findUp', () => {
        spyOn(posix, 'findUp').and.callThrough();

        expect(
            files.findUp('vendor/bin/phpunit', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/vendor/bin/phpunit'));

        expect(posix.findUp).toHaveBeenCalled();
    });

    it('get', () => {
        expect(files.get(pathResolve(__dirname, '../fixtures/foo.txt'))).toEqual('bar');
    });

    it('getAsync', async () => {
        expect(await files.getAsync(pathResolve(__dirname, '../fixtures/foo.txt'))).toEqual('bar');
    });

    it('unlink', () => {
        const file = pathResolve(__dirname, '../fixtures/unlink.txt');
        writeFileSync(file, 'foo');

        expect(existsSync(file)).toBeTruthy();

        files.unlink(file);

        expect(existsSync(file)).toBeFalsy();
    });

    it('tmpfile', () => {
        expect(files.tmpfile('foo', __dirname)).toEqual(pathResolve(__dirname, 'foo'));
    });

    it('type', () => {
        expect(files.type(pathResolve(__dirname, '../fixtures/tests'))).toEqual('d');
        expect(files.type(pathResolve(__dirname, '../fixtures/foo.txt'))).toEqual('f');
    });

    it('dirname', () => {
        expect(files.dirname(pathResolve(__dirname, '../fixtures/usr/bin'))).toEqual(
            pathResolve(__dirname, '../fixtures/usr')
        );
    });
});
