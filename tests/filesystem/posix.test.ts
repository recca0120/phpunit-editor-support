import { POSIX } from '../../src/filesystem';
import { resolve as pathResolve } from 'path';

describe('Posix', () => {
    const files: POSIX = new POSIX();

    it('find', () => {
        expect(
            files.find('php', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/usr/bin/php'));
    });

    it('find system path', () => {
        expect(
            files.find('ls', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
                systemPaths: [pathResolve(__dirname, '../fixtures/bin')],
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/bin/ls'));
    });

    it('exists', () => {
        expect(
            files.exists('php', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toBe(true);

        expect(
            files.exists('pwd', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toBe(false);
    });

    it('findUp', () => {
        expect(
            files.findUp('vendor/bin/phpunit', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/vendor/bin/phpunit'));

        expect(
            files.findUp('phpunit.xml', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/phpunit.xml'));

        expect(
            files.findUp('foo', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual('');
    });
});
