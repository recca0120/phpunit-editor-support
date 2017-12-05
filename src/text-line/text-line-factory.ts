import { Filesystem } from '../filesystem';
import { Line } from './line';
import { Task } from './task';
import { TextLine } from './text-line';

export class TextLineFactory {
    constructor(private files: Filesystem = new Filesystem()) {}

    search(content: string, pattern: RegExp, toTextLine: Task = this.toTextLine): Promise<TextLine[]> {
        return new Promise(resolve => {
            const results: TextLine[] = [];

            if (pattern.flags.indexOf('g') !== -1) {
                let match: RegExpExecArray | null;
                while ((match = pattern.exec(content)) !== null) {
                    const { text, lineNumber, index, input } = this.parseRegExpExecArray(match as RegExpExecArray);
                    results.push(this.createTextLine(toTextLine(text, lineNumber, index, input)));
                }
            } else {
                const match: RegExpExecArray | null = pattern.exec(content);

                if (match === null) {
                    return resolve(results);
                }

                const { text, lineNumber, index, input } = this.parseRegExpExecArray(match as RegExpExecArray);
                results.push(this.createTextLine(toTextLine(text, lineNumber, index, input)));
            }

            resolve(results.filter(item => item.lineNumber !== 0));
        });
    }

    searchFile(file: string, pattern: RegExp, toTextLine: Task = this.toTextLine): Promise<TextLine[]> {
        return this.getContent(file).then((content: string) => this.search(content, pattern, toTextLine));
    }

    private createTextLine(line: Line): TextLine {
        const { lineNumber, text } = line;
        const firstNonWhitespaceCharacterIndex = text.search(/\S|$/);

        return {
            lineNumber,
            text,
            range: {
                start: {
                    line: lineNumber,
                    character: firstNonWhitespaceCharacterIndex,
                },
                end: {
                    line: lineNumber,
                    character: text.length,
                },
            },
            // rangeIncludingLineBreak
            firstNonWhitespaceCharacterIndex: firstNonWhitespaceCharacterIndex,
            isEmptyOrWhitespace: text.length === 0,
        };
    }

    private getContent(file: string): Promise<string> {
        return this.files.getAsync(file).then((content: string) => {
            return Promise.resolve(content);
        });
    }

    private toTextLine(text: string, lineNumber: number): Line {
        return {
            lineNumber,
            text,
        };
    }

    private parseRegExpExecArray(match: RegExpExecArray) {
        const text = match[0];
        const index = match.index;
        const input = match.input;
        const lineNumber = input.substr(0, index).split(/\n/).length - 1;

        return {
            text,
            lineNumber,
            index,
            input,
        };
    }
}
