import { Parser, TeamCityParser, TestCase, Type } from '../../src/parsers';
import { basename, resolve as pathResolve } from 'path';
import { readFile, readFileSync } from 'fs';

import { Filesystem } from '../../src/filesystem';
import { TextLineFactory } from '../../src/text-line-factory';

class FilesystemStub extends Filesystem {
    getAsync(path: string, encoding: string = 'utf8'): Promise<string> {
        path = pathResolve(__dirname, '../fixtures/tests', path.substr(path.lastIndexOf('\\') + 1));

        return new Promise((resolve, reject) => {
            readFile(path, encoding, (error: any, data: any) => {
                return error ? reject(error) : resolve(data);
            });
        });
    }
}

describe('TeamCityParser', () => {
    const getTestCase = (() => {
        const parser: Parser = new TeamCityParser(new Filesystem(), new TextLineFactory(new FilesystemStub()));
        const promise: Promise<TestCase[]> = parser.parse(
            readFileSync(pathResolve(__dirname, '../fixtures/teamcity.txt')).toString()
        );

        return (key: number) => {
            return new Promise(resolve => {
                promise.then(items => {
                    resolve(items[key]);
                });
            });
        };
    })();

    describe('PHPUnit2Test', () => {
        it('passed', async () => {
            expect(await getTestCase(0)).toEqual({
                name: 'testPassed',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 13,
                time: 0.02,
                type: Type.PASSED,
            });
        });

        it('failed', async () => {
            expect(await getTestCase(1)).toEqual({
                name: 'testFailed',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 20,
                time: 0,
                type: Type.FAILURE,
                fault: {
                    message: 'Failed asserting that false is true.',
                    details: [],
                },
            });
        });

        it('skipped', async () => {
            expect(await getTestCase(2)).toEqual({
                name: 'testSkipped',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 25,
                time: 0,
                type: Type.SKIPPED,
                fault: {
                    message: 'The MySQLi extension is not available.',
                    details: [],
                },
            });
        });

        it('incomplete', async () => {
            expect(await getTestCase(3)).toEqual({
                name: 'testIncomplete',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 30,
                time: 0,
                type: Type.SKIPPED,
                fault: {
                    message: 'This test has not been implemented yet.',
                    details: [],
                },
            });
        });

        it('no assertions', async () => {
            expect(await getTestCase(4)).toEqual({
                name: 'testNoAssertions',
                class: 'PHPUnit2Test',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnit2Test.php',
                line: 33,
                time: 0,
                type: Type.RISKY,
                fault: {
                    message: 'This test did not perform any assertions',
                    details: [],
                },
            });
        });
    });

    describe('PHPUnitTest', () => {
        it('passed', async () => {
            expect(await getTestCase(5)).toEqual({
                name: 'testPassed',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 13,
                time: 0,
                type: Type.PASSED,
            });
        });

        it('failed', async () => {
            expect(await getTestCase(6)).toEqual({
                name: 'testFailed',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 20,
                time: 0,
                type: Type.FAILURE,
                fault: {
                    message: 'Failed asserting that false is true.',
                    details: [],
                },
            });
        });

        it('skipped', async () => {
            expect(await getTestCase(7)).toEqual({
                name: 'testSkipped',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 25,
                time: 0,
                type: Type.SKIPPED,
                fault: {
                    message: 'The MySQLi extension is not available.',
                    details: [],
                },
            });
        });

        it('incomplete', async () => {
            expect(await getTestCase(8)).toEqual({
                name: 'testIncomplete',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 30,
                time: 0,
                type: Type.SKIPPED,
                fault: {
                    message: 'This test has not been implemented yet.',
                    details: [],
                },
            });
        });

        it('no assertions', async () => {
            expect(await getTestCase(9)).toEqual({
                name: 'testNoAssertions',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 33,
                time: 0,
                type: Type.RISKY,
                fault: {
                    message: 'This test did not perform any assertions',
                    details: [],
                },
            });
        });

        it('array is not same', async () => {
            expect(await getTestCase(10)).toEqual({
                name: 'testAssertNotEquals',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 39,
                time: 0,
                type: Type.FAILURE,
                fault: {
                    message:
                        "Failed asserting that Array &0 (\n    'e' => 'f'\n    0 => 'g'\n    1 => 'h'\n) is identical to Array &0 (\n    'a' => 'b'\n    'c' => 'd'\n).",
                    details: [],
                },
            });
        });

        it('details has current file', async () => {
            expect(await getTestCase(11)).toEqual({
                name: 'testDetailsHasCurrentFile',
                class: 'PHPUnitTest',
                classname: null,
                file: 'C:\\Users\\recca\\Desktop\\vscode-phpunit\\tests\\fixtures\\PHPUnitTest.php',
                line: 31,
                time: 0.99,
                type: Type.FAILURE,
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
