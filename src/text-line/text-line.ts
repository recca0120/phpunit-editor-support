import { Range } from './range';

export interface TextLine {
    /**
     * The zero-based line number.
     */
    readonly lineNumber: number;

    /**
     * The text of this line without the line separator characters.
     */
    readonly text: string;

    /**
     * The range this line covers without the line separator characters.
     */
    readonly range: Range;

    /**
     * The range this line covers with the line separator characters.
     */
    // readonly rangeIncludingLineBreak: Range;

    /**
     * The offset of the first character which is not a whitespace character as defined
     * by `/\s/`. **Note** that if a line is all whitespaces the length of the line is returned.
     */
    readonly firstNonWhitespaceCharacterIndex: number;

    /**
     * Whether this line is whitespace only, shorthand
     * for [TextLineFactory.firstNonWhitespaceCharacterIndex](#TextLineFactory.firstNonWhitespaceCharacterIndex) === [TextLineFactory.text.length](#TextLineFactory.text).
     */
    readonly isEmptyOrWhitespace: boolean;
}
