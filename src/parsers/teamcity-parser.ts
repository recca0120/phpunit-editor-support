import { Detail } from './detail';
import { Parser } from './parser';
import { TeamCity } from './teamcity';
import { TestCase } from './test-case';
import { TextLine } from '../text-line';
import { Type } from './type';
import { tap } from '../helpers';

const minimistString = require('minimist-string');

export class TeamCityParser extends Parser {
    private typeMap: any = {
        testPassed: Type.PASSED,
        testFailed: Type.FAILURE,
        testIgnored: Type.SKIPPED,
    };

    parse(content: string): Promise<TestCase[]> {
        return this.parseString(content);
    }

    parseString(content: string): Promise<TestCase[]> {
        return Promise.all(this.groupByType(this.parseTeamCity(content)).map(group => this.parseTestCase(group)));
    }

    protected parseTestCase(group: any): Promise<TestCase> {
        if (group.length === 2) {
            group.splice(1, 0, {
                eventName: 'testPassed',
            });
        }

        const [start, error, finish] = group;
        const [file, className, name] = start.locationHint
            .replace(/php_qn:\/\//g, '')
            .replace(/::\\/g, '::')
            .split('::');

        const type = this.typeMap[error.eventName];

        const testCase: TestCase = {
            name,
            class: className.substr(className.lastIndexOf('\\') + 1),
            classname: null,
            file,
            line: 0,
            time: parseFloat(finish.duration as string) / 1000,
            type,
        };

        if (type !== Type.PASSED) {
            const details: Detail[] = this.parseDetails(error.details as string);
            const currentFile = this.currentFile(details, testCase);

            Object.assign(testCase, currentFile, {
                type: currentFile.line === 0 && testCase.type === Type.FAILURE ? Type.RISKY : testCase.type,
                fault: {
                    message: error.message,
                    details: this.filterDetails(details, currentFile),
                },
            });

            if (testCase.line !== 0) {
                return Promise.resolve(testCase);
            }
        }

        const pattern = new RegExp(` *public\\s+function\\s+${name}\\s*\\(.*`);

        return this.textLine(file, pattern).then((items: TextLine[]) => {
            const textLine =
                items.length > 0
                    ? items[0]
                    : {
                          lineNumber: 0,
                      };

            return Object.assign(testCase, {
                line: textLine.lineNumber + 1,
            });
        });
    }

    private parseTeamCity(content: string): TeamCity[] {
        return content
            .split(/\r|\n/)
            .filter(line => /^##teamcity/.test(line))
            .map(line => {
                line = line
                    .trim()
                    .replace(/^##teamcity\[|\]$/g, '')
                    .replace(/\\/g, '||')
                    .replace(/\|\'/g, "\\'");

                const argv: string[] = minimistString(line)._;
                const teamCity: TeamCity = {
                    eventName: argv.shift() as string,
                };

                return argv.reduce((options, arg) => {
                    return tap(options, (opts: any) => {
                        const split = arg.split('=');
                        const key = split.shift() as string;
                        const value = split
                            .join('=')
                            .replace(/\|\|/g, '\\')
                            .replace(/\|n/g, '\n')
                            .trim();

                        opts[key] = value;
                    });
                }, teamCity);
            })
            .filter(item => ['testCount', 'testSuiteStarted', 'testSuiteFinished'].indexOf(item.eventName) === -1);
    }

    private groupByType(items: TeamCity[]): TeamCity[][] {
        let counter = 0;

        return items.reduce((results: any[], item: TeamCity) => {
            if (!results[counter]) {
                results[counter] = [];
            }

            results[counter].push(item);

            if (item.eventName === 'testFinished') {
                counter++;
            }

            return results;
        }, []);
    }
}
