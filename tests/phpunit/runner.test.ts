import { Filesystem } from '../../src/filesystem';
import { JUnitParser } from '../../src/parsers/index';
import { PHPUnit } from '../../src/phpunit';
import { ParserFactory } from '../../src/parsers';
import { Process } from '../../src/process';
import { ProcessFactory } from '../../src/process';
import { isWindows } from '../../src/helpers';
import { resolve as pathResolve } from 'path';

describe('PHPUnit', () => {
    it('run', async () => {
        const parserFactory = new ParserFactory();
        const processFactory: ProcessFactory = new ProcessFactory();
        const files = new Filesystem();
        const process = new Process();
        const parser = new JUnitParser();

        const phpunit: PHPUnit = new PHPUnit(files, processFactory, parserFactory);

        spyOn(files, 'type').and.returnValue('f');
        spyOn(processFactory, 'create').and.returnValue(process);
        spyOn(process, 'spawn').and.returnValue(Promise.resolve(''));
        spyOn(parserFactory, 'create').and.returnValue(parser);
        spyOn(parser, 'parse').and.returnValue(Promise.resolve([]));
        spyOn(files, 'unlink').and.returnValue(true);

        await phpunit.run(pathResolve(__dirname, '../fixtures/tests/PHPUnitTest.php'), [], {
            rootPath: pathResolve(__dirname, '../fixtures/tests/'),
        });
    });

    it('getExecutable', () => {
        const files = new Filesystem();
        const phpunit: PHPUnit = new PHPUnit(files);
        const cwd = pathResolve(__dirname, '../fixtures/tests/');
        const rootPath = pathResolve(__dirname, '../fixtures/');

        expect(
            phpunit.getExecutable(cwd, {
                rootPath,
                execPath: '',
            })
        ).toEqual([pathResolve(__dirname, '../fixtures/vendor/bin/phpunit') + (isWindows() ? '.bat' : '')]);
    });
});
