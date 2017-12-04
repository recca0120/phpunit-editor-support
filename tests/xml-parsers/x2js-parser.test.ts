import { Parser, TestCase, Type } from '../../src/parsers';

import { Filesystem } from '../../src/filesystem';
import { JUnitParser } from '../../src/parsers';
import { TextLineFactory } from '../../src/text-line-factory';
import { X2jsParser } from '../../src/xml-parsers';
import { resolve as pathResolve } from 'path';

describe('X2jsParser', () => {
    const getTestCase = (() => {
        const parser: Parser = new JUnitParser(new Filesystem(), new TextLineFactory(), new X2jsParser());
        const promise: Promise<TestCase[]> = parser.parse(pathResolve(__dirname, '../fixtures/junit.xml'));

        return (key: number) => {
            return new Promise(resolve => {
                promise.then(items => {
                    resolve(items[key]);
                });
            });
        };
    })();

    it('passed', async () => {
        expect(await getTestCase(0)).toEqual({
            name: 'testPassed',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 13,
            time: 0.006241,
            type: Type.PASSED,
        });
    });

    it('failed', async () => {
        expect(await getTestCase(1)).toEqual({
            name: 'testFailed',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 20,
            time: 0.001918,
            type: Type.FAILURE,
            fault: {
                type: 'PHPUnit_Framework_ExpectationFailedException',
                message: 'Failed asserting that false is true.',
                details: [],
            },
        });
    });

    it('error', async () => {
        expect(await getTestCase(2)).toEqual({
            name: 'testError',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 25,
            time: 0.001087,
            type: Type.ERROR,
            fault: {
                type: 'PHPUnit_Framework_Exception',
                message:
                    'Argument #1 (No Value) of PHPUnit_Framework_Assert::assertInstanceOf() must be a class or interface name',
                details: [],
            },
        });
    });

    it('skipped', async () => {
        expect(await getTestCase(3)).toEqual({
            name: 'testSkipped',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 30,
            time: 0.001138,
            type: Type.SKIPPED,
            fault: {
                type: 'PHPUnit_Framework_SkippedTestError',
                message: 'Skipped Test',
                details: [],
            },
        });
    });

    it('incomplete', async () => {
        expect(await getTestCase(4)).toEqual({
            name: 'testIncomplete',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 35,
            time: 0.001081,
            type: Type.INCOMPLETE,
            fault: {
                type: 'PHPUnit_Framework_IncompleteTestError',
                message: 'Incomplete Test',
                details: [],
            },
        });
    });

    it('exception', async () => {
        expect(await getTestCase(5)).toEqual({
            name: 'testReceive',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 45,
            time: 0.164687,
            type: Type.ERROR,
            fault: {
                type: 'BadMethodCallException',
                message:
                    'Method Mockery_1_Symfony_Component_HttpFoundation_File_UploadedFile::getClientOriginalName() does not exist on this mock object',
                details: [
                    {
                        file: 'C:\\Users\\recca\\github\\tester-phpunit\\src\\Receiver.php',
                        line: 85,
                    },
                    {
                        file: 'C:\\Users\\recca\\github\\tester-phpunit\\src\\Receiver.php',
                        line: 68,
                    },
                ],
            },
        });
    });

    it('current mockery call', async () => {
        expect(await getTestCase(6)).toEqual({
            name: 'testCleanDirectory',
            class: 'Recca0120\\Upload\\Tests\\PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 13,
            time: 0.008761,
            type: Type.ERROR,
            fault: {
                type: 'Mockery\\Exception\\InvalidCountException',
                message: [
                    'Mockery\\Exception\\InvalidCountException: Method delete("C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php") from Mockery_1_Recca0120_Upload_Filesystem should be called',
                    ' exactly 1 times but called 0 times.',
                ].join('\n'),
                details: [
                    {
                        file:
                            'C:\\Users\\recca\\UniServerZ\\www\\driways\\laravel\\vendor\\mockery\\mockery\\library\\Mockery\\CountValidator\\Exact.php',
                        line: 37,
                    },
                    {
                        file:
                            'C:\\Users\\recca\\UniServerZ\\www\\driways\\laravel\\vendor\\mockery\\mockery\\library\\Mockery\\Expectation.php',
                        line: 298,
                    },
                    {
                        file:
                            'C:\\Users\\recca\\UniServerZ\\www\\driways\\laravel\\vendor\\mockery\\mockery\\library\\Mockery\\ExpectationDirector.php',
                        line: 120,
                    },
                    {
                        file:
                            'C:\\Users\\recca\\UniServerZ\\www\\driways\\laravel\\vendor\\mockery\\mockery\\library\\Mockery\\Container.php',
                        line: 297,
                    },
                    {
                        file:
                            'C:\\Users\\recca\\UniServerZ\\www\\driways\\laravel\\vendor\\mockery\\mockery\\library\\Mockery\\Container.php',
                        line: 282,
                    },
                    {
                        file:
                            'C:\\Users\\recca\\UniServerZ\\www\\driways\\laravel\\vendor\\mockery\\mockery\\library\\Mockery.php',
                        line: 152,
                    },
                    {
                        file: 'C:\\ProgramData\\ComposerSetup\\vendor\\phpunit\\phpunit\\src\\TextUI\\Command.php',
                        line: 188,
                    },
                    {
                        file: 'C:\\ProgramData\\ComposerSetup\\vendor\\phpunit\\phpunit\\src\\TextUI\\Command.php',
                        line: 118,
                    },
                ],
            },
        });
    });

    it('testcase has skipped tag', async () => {
        expect(await getTestCase(7)).toEqual({
            name: 'testSkipped',
            class: 'PHPUnitTest',
            classname: 'PHPUnitTest',
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 23,
            time: 0.001352,
            type: Type.SKIPPED,
            fault: {
                type: 'skipped',
                message: '',
                details: [],
            },
        });
    });

    it('testcase has incomplete tag', async () => {
        expect(await getTestCase(8)).toEqual({
            name: 'testIncomplete',
            class: 'PHPUnitTest',
            classname: 'PHPUnitTest',
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 28,
            time: 0.000954,
            type: Type.SKIPPED,
            fault: {
                type: 'skipped',
                message: '',
                details: [],
            },
        });
    });

    it('risky', async () => {
        expect(await getTestCase(9)).toEqual({
            name: 'testRisky',
            class: 'PHPUnitTest',
            classname: 'PHPUnitTest',
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 35,
            time: 0.205927,
            type: Type.RISKY,
            fault: {
                type: 'PHPUnit\\Framework\\RiskyTestError',
                message: 'Risky Test',
                details: [
                    {
                        file: 'C:\\ProgramData\\ComposerSetup\\vendor\\phpunit\\phpunit\\src\\TextUI\\Command.php',
                        line: 195,
                    },
                    {
                        file: 'C:\\ProgramData\\ComposerSetup\\vendor\\phpunit\\phpunit\\src\\TextUI\\Command.php',
                        line: 148,
                    },
                ],
            },
        });
    });
});
