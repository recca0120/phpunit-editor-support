import { Runner, RunnerParams } from '../src/runner';

import { Filesystem } from '../src/filesystem';
import { JUnitParser } from '../src/parsers';
import { ParserFactory } from '../src/parser-factory';
import { Process } from '../src/process';
import { ProcessFactory } from '../src/process-factory';
import { resolve as pathResolve } from 'path';

describe('Command Options Tests', () => {
    it('filter options', () => {
        const options = new RunnerParams(['--log-junit', 'test.xml', '--teamcity', '-d', 'a=b', '-d', 'c=d', 'ssh']);

        expect(options.has('--log-junit')).toBe(false);
        expect(options.has('--teamcity')).toBe(true);

        options.put('--log-junit', 'junit.xml');

        expect(options.toParams()).toEqual(['ssh', '-d', 'a=b', '-d', 'c=d', '--log-junit', 'junit.xml', '--teamcity']);
    });
});

describe('PHPUnit Tests', () => {
    it('get error messages', async () => {
        const parserFactory = new ParserFactory();
        const parser = new JUnitParser();
        const processFactory = new ProcessFactory();
        const process = new Process();
        const files = new Filesystem();
        const phpunit = new Runner(parserFactory, processFactory, files);
        const tests = await parser.parse(pathResolve(__dirname, 'fixtures/junit.xml'));
        const optons = {
            execPath: 'phpunit',
            rootPath: __dirname,
        };

        const path = 'FooTest.php';

        spyOn(files, 'isFile').and.returnValue(true);
        spyOn(files, 'dirname').and.returnValue(__dirname);
        spyOn(files, 'findUp').and.returnValues('phpunit.xml', 'phpunit');

        spyOn(processFactory, 'create').and.returnValue(process);
        spyOn(parserFactory, 'create').and.returnValue(parser);
        spyOn(parser, 'parse').and.returnValue(Promise.resolve(tests));
        spyOn(process, 'spawn').and.returnValue(Promise.resolve(process));

        const result = await phpunit.run(path, [], optons);

        expect(files.isFile).toHaveBeenCalled();
        expect(files.dirname).toHaveBeenCalled();
        expect(files.findUp).toHaveBeenCalled();
        expect(process.spawn).toHaveBeenCalled();
        expect(parser.parse).toHaveBeenCalled();

        expect(result).toBe(tests);
    });
});
