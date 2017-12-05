import { Windows } from '../../src/filesystem';
import { isWindows } from '../../src/helpers';
import { resolve as pathResolve } from 'path';

describe('Windows', () => {
    const files: Windows = new Windows();

    it('find', () => {
        if (isWindows() === false) {
            return;
        }

        expect(
            files.find('php', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/usr/bin/php.exe'));
    });

    it('find system path', () => {
        if (isWindows() === false) {
            return;
        }

        expect(
            files.find('cmd', {
                cwd: pathResolve(__dirname, '../fixtures/usr/bin'),
                systemPaths: [pathResolve(__dirname, '../fixtures/bin')],
            })
        ).toEqual(pathResolve(__dirname, '../fixtures/bin/cmd.exe'));
    });

    it('exists', () => {
        if (isWindows() === false) {
            return;
        }

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
        if (isWindows() === false) {
            return;
        }

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
