import { Detail } from './detail';
import { Filesystem } from '../filesystem';
import { TestCase } from './test-case';
import { TextLine } from '../text-line';
import { TextLineFactory } from '../text-line-factory';

export abstract class Parser {
    constructor(
        protected files: Filesystem = new Filesystem(),
        protected textLineFactory: TextLineFactory = new TextLineFactory()
    ) {}

    parseFile(path: string): Promise<TestCase[]> {
        return this.files.getAsync(path).then((content: string) => this.parseString(content));
    }

    abstract parse(content: string): Promise<TestCase[]>;

    abstract parseString(content: string): Promise<TestCase[]>;

    protected abstract parseTestCase(data: any): Promise<TestCase>;

    protected currentFile(details: Detail[], testCase: TestCase): Detail {
        return (
            details.find(detail => testCase.file === detail.file && testCase.line !== detail.line) || {
                file: testCase.file,
                line: testCase.line,
            }
        );
    }

    protected filterDetails(details: Detail[], currentFile: Detail): Detail[] {
        return details.filter(detail => detail.file !== currentFile.file && currentFile.line !== detail.line);
    }

    protected parseDetails(content: string): Detail[] {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => /(.*):(\d+)$/.test(line))
            .map(path => {
                const [, file, line] = path.match(/(.*):(\d+)/) as string[];

                return {
                    file: file.trim(),
                    line: parseInt(line, 10),
                };
            });
    }

    protected textLine(file: string, pattern: RegExp): Promise<TextLine[]> {
        return this.textLineFactory.searchFile(file, pattern);
    }
}
