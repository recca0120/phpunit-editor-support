import { isWindows, parseSentence } from '../../src/helpers';

import { Filesystem } from '../../src/filesystem';
import { JUnitParser } from '../../src/parsers/index';
import { ParserFactory } from '../../src/parser-factory';
import { Process } from '../../src/process';
import { ProcessFactory } from '../../src/process-factory';
import { Runner } from '../../src/runner';
import { resolve as pathResolve } from 'path';

describe('Runner', () => {
    it('run', async () => {
        const parserFactory = new ParserFactory();
        const processFactory: ProcessFactory = new ProcessFactory();
        const files = new Filesystem();
        const process = new Process();
        const parser = new JUnitParser();

        const runner: Runner = new Runner(files, processFactory, parserFactory);

        spyOn(files, 'type').and.returnValue('f');
        spyOn(processFactory, 'create').and.returnValue(process);
        spyOn(process, 'spawn').and.returnValue(Promise.resolve(''));
        spyOn(parserFactory, 'create').and.returnValue(parser);
        spyOn(parser, 'parse').and.returnValue(Promise.resolve([]));
        spyOn(files, 'unlink').and.returnValue(true);

        await runner.run(pathResolve(__dirname, '../fixtures/tests/PHPUnitTest.php'), [], {
            rootPath: pathResolve(__dirname, '../fixtures/tests/'),
        });
    });

    it('getExecutable', () => {
        const files = new Filesystem();
        const runner: Runner = new Runner(files);
        const cwd = pathResolve(__dirname, '../fixtures/tests/PHPUnitTest.php');
        const rootPath = pathResolve(__dirname, '../fixtures/');

        expect(
            runner.getExecutable(cwd, {
                rootPath,
                execPath: '',
            })
        ).toEqual([pathResolve(__dirname, '../fixtures/vendor/bin/phpunit')]);
    });
});
