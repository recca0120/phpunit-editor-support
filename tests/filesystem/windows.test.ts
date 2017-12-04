import { Windows } from '../../src/filesystem';
import { resolve as pathResolve } from 'path';

describe('Windows', () => {
    const files: Windows = new Windows();

    it('find', () => {
        expect(
            files.find('php', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/usr/bin/php.exe'));
    });

    it('find system path', () => {
        expect(
            files.find('cmd', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
                systemPaths: [pathResolve(__dirname, '../fixtures/bin')],
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/bin/cmd.exe'));
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
        ).toEqual(pathResolve(__dirname, '../fixtures/vendor/bin/phpunit.bat'));

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
