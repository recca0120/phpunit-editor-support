import { JUnitParser, State, TeamCityParser, TestCase } from '../src/parsers';

import { Filesystem } from '../src/filesystem';
import { TextLineFactory } from '../src/text-line';
import { FastXmlParser as XmlParser } from '../src/xml-parsers';
import { resolve as pathResolve } from 'path';

describe('JUnitParser', () => {
    const files: Filesystem = new Filesystem();
    const textLineFactory: TextLineFactory = new TextLineFactory(files);
    const parser: JUnitParser = new JUnitParser(files, textLineFactory, new XmlParser());

    async function getTestCase(key: number): Promise<TestCase> {
        const testCases: TestCase[] = await parser.parse(pathResolve(__dirname, 'fixtures/junit.xml'));

        return testCases[key];
    }

    beforeEach(() => {
        spyOn(files, 'getAsync').and.callFake(fileName => {
            return Promise.resolve(files.get(fileName));
        });
    });

    it('it should parse passed', async () => {
        const testCase = await getTestCase(0);

        expect(testCase).toEqual({
            name: 'testPassed',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 13,
            time: 0.006241,
            type: State.PASSED,
        });
    });

    it('it should parse failed', async () => {
        const testCase = await getTestCase(1);

        expect(testCase).toEqual({
            name: 'testFailed',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 20,
            time: 0.001918,
            type: State.FAILURE,
            fault: {
                type: 'PHPUnit_Framework_ExpectationFailedException',
                message: 'Failed asserting that false is true.',
                details: [],
            },
        });
    });

    it('it should parse error', async () => {
        const testCase = await getTestCase(2);

        expect(testCase).toEqual({
            name: 'testError',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 25,
            time: 0.001087,
            type: State.ERROR,
            fault: {
                type: 'PHPUnit_Framework_Exception',
                message:
                    'Argument #1 (No Value) of PHPUnit_Framework_Assert::assertInstanceOf() must be a class or interface name',
                details: [],
            },
        });
    });

    it('it should parse skipped', async () => {
        const testCase = await getTestCase(3);

        expect(testCase).toEqual({
            name: 'testSkipped',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 30,
            time: 0.001138,
            type: State.SKIPPED,
            fault: {
                type: 'PHPUnit_Framework_SkippedTestError',
                message: 'Skipped Test',
                details: [],
            },
        });
    });

    it('it should parse incomplete', async () => {
        const testCase = await getTestCase(4);

        expect(testCase).toEqual({
            name: 'testIncomplete',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 35,
            time: 0.001081,
            type: State.INCOMPLETE,
            fault: {
                type: 'PHPUnit_Framework_IncompleteTestError',
                message: 'Incomplete Test',
                details: [],
            },
        });
    });

    it('it should parse exception', async () => {
        const testCase = await getTestCase(5);

        expect(testCase).toEqual({
            name: 'testReceive',
            class: 'PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 45,
            time: 0.164687,
            type: State.ERROR,
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

    it('it should get current error message when mockery call not correct.', async () => {
        const testCase = await getTestCase(6);

        expect(testCase).toEqual({
            name: 'testCleanDirectory',
            class: 'Recca0120\\Upload\\Tests\\PHPUnitTest',
            classname: null,
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 13,
            time: 0.008761,
            type: State.ERROR,
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

    it('it should be skipped when testcase has skipped tag', async () => {
        const testCase = await getTestCase(7);

        expect(testCase).toEqual({
            name: 'testSkipped',
            class: 'PHPUnitTest',
            classname: 'PHPUnitTest',
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 23,
            time: 0.001352,
            type: State.SKIPPED,
            fault: {
                type: 'skipped',
                message: '',
                details: [],
            },
        });
    });

    it('it should be skipped when testcase has incomplete tag', async () => {
        const testCase = await getTestCase(8);

        expect(testCase).toEqual({
            name: 'testIncomplete',
            class: 'PHPUnitTest',
            classname: 'PHPUnitTest',
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 28,
            time: 0.000954,
            type: State.SKIPPED,
            fault: {
                type: 'skipped',
                message: '',
                details: [],
            },
        });
    });

    it('it should be risky when testcase exception is PHPUnitFrameworkRiskyTestError', async () => {
        const testCase = await getTestCase(9);

        expect(testCase).toEqual({
            name: 'testRisky',
            class: 'PHPUnitTest',
            classname: 'PHPUnitTest',
            file: 'C:\\Users\\recca\\github\\tester-phpunit\\tests\\PHPUnitTest.php',
            line: 35,
            time: 0.205927,
            type: State.RISKY,
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

describe('TeamCityParser', () => {
    const files: Filesystem = new Filesystem();
    const files2: Filesystem = new Filesystem();

    const textLineFactory: TextLineFactory = new TextLineFactory(files);
    const parser: TeamCityParser = new TeamCityParser(files2, textLineFactory);

    async function getTestCase(key: number): Promise<TestCase> {
        const testCases: TestCase[] = await parser.parseFile(pathResolve(__dirname, 'fixtures/teamcity.txt'));

        return testCases[key];
    }

    describe('PHPUnit2Test', () => {
        beforeEach(() => {
            spyOn(files, 'getAsync').and.callFake(fileName => {
                return Promise.resolve(files.get(pathResolve(__dirname, 'fixtures/PHPUnit2Test.php')));
            });

            spyOn(files2, 'getAsync').and.callFake(fileName => {
                return Promise.resolve(files.get(pathResolve(__dirname, 'fixtures/teamcity.txt')));
            });
        });

        it('it should parse passed', async () => {
            const testCase = await getTestCase(0);

            expect(testCase).toEqual({
                name: 'testPassed',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 13,
                time: 0.02,
                type: State.PASSED,
            });
        });

        it('it should parse failed', async () => {
            const testCase = await getTestCase(1);

            expect(testCase).toEqual({
                name: 'testFailed',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 20,
                time: 0,
                type: State.FAILURE,
                fault: {
                    message: 'Failed asserting that false is true.',
                    details: [],
                },
            });
        });

        it('it should parse skipped when mark skipped', async () => {
            const testCase = await getTestCase(2);

            expect(testCase).toEqual({
                name: 'testSkipped',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 25,
                time: 0,
                type: State.SKIPPED,
                fault: {
                    message: 'The MySQLi extension is not available.',
                    details: [],
                },
            });
        });

        it('it should parse skipped when mark incomplete', async () => {
            const testCase = await getTestCase(3);

            expect(testCase).toEqual({
                name: 'testIncomplete',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 30,
                time: 0,
                type: State.SKIPPED,
                fault: {
                    message: 'This test has not been implemented yet.',
                    details: [],
                },
            });
        });

        it('it should parse risky when no assertions', async () => {
            const testCase = await getTestCase(4);

            expect(testCase).toEqual({
                name: 'testNoAssertions',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 33,
                time: 0,
                type: State.RISKY,
                fault: {
                    message: 'This test did not perform any assertions',
                    details: [],
                },
            });
        });
    });

    describe('PHPUnitTest', () => {
        beforeEach(() => {
            spyOn(files, 'getAsync').and.callFake(fileName => {
                return Promise.resolve(files.get(pathResolve(__dirname, 'fixtures/PHPUnit2Test.php')));
            });

            spyOn(files2, 'getAsync').and.callFake(fileName => {
                return Promise.resolve(files.get(pathResolve(__dirname, 'fixtures/teamcity.txt')));
            });
        });

        it('it should parse passed', async () => {
            const testCase = await getTestCase(5);

            expect(testCase).toEqual({
                name: 'testPassed',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 13,
                time: 0,
                type: State.PASSED,
            });
        });

        it('it should parse failed', async () => {
            const testCase = await getTestCase(6);

            expect(testCase).toEqual({
                name: 'testFailed',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 20,
                time: 0,
                type: State.FAILURE,
                fault: {
                    message: 'Failed asserting that false is true.',
                    details: [],
                },
            });
        });

        it('it should parse skipped when mark skipped', async () => {
            const testCase = await getTestCase(7);

            expect(testCase).toEqual({
                name: 'testSkipped',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 25,
                time: 0,
                type: State.SKIPPED,
                fault: {
                    message: 'The MySQLi extension is not available.',
                    details: [],
                },
            });
        });

        it('it should parse skipped when mark incomplete', async () => {
            const testCase = await getTestCase(8);

            expect(testCase).toEqual({
                name: 'testIncomplete',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 30,
                time: 0,
                type: State.SKIPPED,
                fault: {
                    message: 'This test has not been implemented yet.',
                    details: [],
                },
            });
        });

        it('it should parse no assertions', async () => {
            const testCase = await getTestCase(9);

            expect(testCase).toEqual({
                name: 'testNoAssertions',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 33,
                time: 0,
                type: State.RISKY,
                fault: {
                    message: 'This test did not perform any assertions',
                    details: [],
                },
            });
        });

        it('it should parse array is not same', async () => {
            const testCase = await getTestCase(10);

            expect(testCase).toEqual({
                name: 'testAssertNotEquals',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 39,
                time: 0,
                type: State.FAILURE,
                fault: {
                    message:
                        "Failed asserting that Array &0 (\n    'e' => 'f'\n    0 => 'g'\n    1 => 'h'\n) is identical to Array &0 (\n    'a' => 'b'\n    'c' => 'd'\n).",
                    details: [],
                },
            });
        });

        it('details has current file', async () => {
            const testCase = await getTestCase(11);

            expect(testCase).toEqual({
                name: 'testDetailsHasCurrentFile',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 31,
                time: 0.99,
                type: State.FAILURE,
                fault: {
                    message: 'Invalid JSON was returned from the route.',
                    details: [
                        {
                            file:
                                'C:\\Users\\recca\\Desktop\\vscode-phpunit\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Testing\\TestResponse.php',
                            line: 434,
                        },
                        {
                            file:
                                'C:\\Users\\recca\\Desktop\\vscode-phpunit\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Testing\\TestResponse.php',
                            line: 290,
                        },
                    ],
                },
            });
        });
    });
});
