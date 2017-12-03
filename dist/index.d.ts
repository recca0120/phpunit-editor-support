/// <reference types="node" />
declare module "helpers" {
    export function isWindows(): boolean;
    export function tap(val: any, callback: Function): any;
}
declare module "filesystem" {
    export interface FilesOptions {
        cwd?: string;
        rootPath?: string;
    }
    export interface Files {
        find(search: string[] | string, opts?: {}): string;
        exists(search: string[] | string, opts?: {}): boolean;
        findUp(search: string[] | string, opts?: {}): string;
    }
    export class POSIX implements Files {
        protected systemPaths: string[];
        protected extensions: string[];
        protected separator: string;
        findUp(search: string[] | string, opts?: FilesOptions): string;
        find(search: string[] | string, opts?: FilesOptions): string;
        exists(search: string[] | string, opts?: FilesOptions): boolean;
        protected usePath(search: string[] | string, opts?: FilesOptions): string;
        protected useSystemPath(search: string[] | string): string;
        protected isFile(path: string): boolean;
    }
    export class Windows extends POSIX {
        protected systemPaths: string[];
        protected extensions: string[];
        protected separator: string;
    }
    export abstract class Cacheable {
        protected cache: Map<string, string>;
        protected key(search: string[] | string, opts?: string[]): string;
    }
    export class Filesystem extends Cacheable {
        private files;
        constructor(files?: POSIX);
        findUp(search: string[] | string, opts?: any): string;
        find(search: string[] | string, opts?: any): string;
        exists(search: string[] | string, opts?: any): boolean;
        get(path: string): string;
        getAsync(path: string, encoding?: string): Promise<string>;
        unlink(file: string): void;
        tmpfile(tmpname: string, dir?: string): string;
        isFile(path: string): boolean;
        dirname(path: string): string;
    }
}
declare module "xml-parsers" {
    export interface XmlParser {
        parse(content: string): Promise<any>;
        map(testCaseNode: any): any;
    }
    export class FastXmlParser implements XmlParser {
        parse(content: string): Promise<any>;
        map(testCaseNode: any): any;
    }
    export class X2jsParser implements XmlParser {
        parse(content: string): Promise<any>;
        map(testCaseNode: any): any;
    }
    export class Xml2jsParser implements XmlParser {
        parse(content: string): Promise<any>;
        map(testCaseNode: any): any;
        private faultNode(faultNode);
    }
}
declare module "text-line" {
    import { Filesystem } from "filesystem";
    export interface Line {
        text: string;
        lineNumber: number;
    }
    export interface Task {
        (text: string, lineNumber: number, index: number, input: string): Line;
    }
    export interface Position {
        line: number;
        character: number;
    }
    export interface Range {
        start: Position;
        end: Position;
    }
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
    export class TextLineFactory {
        private files;
        constructor(files?: Filesystem);
        search(content: string, pattern: RegExp, toTextLine?: Task): Promise<TextLine[]>;
        searchFile(file: string, pattern: RegExp, toTextLine?: Task): Promise<TextLine[]>;
        private createTextLine(line);
        private getContent(file);
        private toTextLine(text, lineNumber);
        private parseRegExpExecArray(match);
    }
}
declare module "parsers" {
    import { XmlParser as IXmlParser } from "xml-parsers";
    import { TextLine, TextLineFactory } from "text-line";
    import { Filesystem } from "filesystem";
    export enum Type {
        PASSED = "passed",
        ERROR = "error",
        WARNING = "warning",
        FAILURE = "failure",
        INCOMPLETE = "incomplete",
        RISKY = "risky",
        SKIPPED = "skipped",
        FAILED = "failed",
    }
    export interface Detail {
        file: string;
        line: number;
    }
    export interface Fault {
        message: string;
        type?: string;
        details?: Detail[];
    }
    export interface TestCase {
        name: string;
        class: string;
        classname?: string | null;
        file: string;
        line: number;
        time: number;
        type: Type;
        fault?: Fault;
    }
    export abstract class Parser {
        protected files: Filesystem;
        protected textLineFactory: TextLineFactory;
        constructor(files?: Filesystem, textLineFactory?: TextLineFactory);
        parseFile(path: string): Promise<TestCase[]>;
        abstract parse(content: string): Promise<TestCase[]>;
        abstract parseString(content: string): Promise<TestCase[]>;
        protected abstract parseTestCase(data: any): Promise<TestCase>;
        protected currentFile(details: Detail[], testCase: TestCase): Detail;
        protected filterDetails(details: Detail[], currentFile: Detail): Detail[];
        protected parseDetails(content: string): Detail[];
        protected textLine(file: string, pattern: RegExp): Promise<TextLine[]>;
    }
    export class JUnitParser extends Parser {
        protected files: Filesystem;
        protected textLineFactory: TextLineFactory;
        private xmlParser;
        constructor(files?: Filesystem, textLineFactory?: TextLineFactory, xmlParser?: IXmlParser);
        parse(path: string): Promise<TestCase[]>;
        parseString(content: string): Promise<TestCase[]>;
        private parseTestSuite(testSuiteNode);
        protected parseTestCase(testCaseNode: any): Promise<TestCase>;
        private getFaultNode(testCaseNode);
        private parseMessage(faultNode, details);
        private parseErrorType(errorNode);
        private normalize(content);
    }
    export class TeamCityParser extends Parser {
        private typeMap;
        parse(content: string): Promise<TestCase[]>;
        parseString(content: string): Promise<TestCase[]>;
        protected parseTestCase(group: any): Promise<TestCase>;
        private parseTeamCity(content);
        private groupByType(items);
    }
    export class ParserFactory {
        protected files: Filesystem;
        protected textLineFactory: TextLineFactory;
        constructor(files?: Filesystem, textLineFactory?: TextLineFactory);
        create(name: string): Parser;
    }
}
declare module "process" {
    import { SpawnOptions } from 'child_process';
    import { EventEmitter } from 'events';
    export class Process {
        private dispatcher;
        constructor(dispatcher?: EventEmitter);
        spawn(parameters: string[], options?: SpawnOptions): Promise<string>;
        on(name: string | symbol, callback: any): Process;
    }
    export class ProcessFactory {
        create(process?: Process): Process;
    }
}
declare module "runner" {
    import { EventEmitter } from 'events';
    import { Filesystem } from "filesystem";
    import { ParserFactory } from "parsers";
    import { ProcessFactory } from "process";
    import { TestCase } from "parsers";
    export enum State {
        PHPUNIT_GIT_FILE = "phpunit_git_file",
        PHPUNIT_NOT_FOUND = "phpunit_not_found",
        PHPUNIT_EXECUTE_ERROR = "phpunit_execute_error",
        PHPUNIT_NOT_TESTCASE = "phpunit_not_testcase",
        PHPUNIT_NOT_PHP = "phpunit_not_php",
    }
    export interface RunnerOptions {
        rootPath?: string;
        execPath?: string;
    }
    export class RunnerParams {
        private options;
        constructor(options?: string[]);
        has(key: string): boolean;
        put(key: string, value: any): this;
        get(key: string): any;
        remove(key: string): void;
        toParams(): any;
        private normalizeKey(key);
        private parseOptions(opts);
    }
    export class Runner {
        private parserFactory;
        private processFactory;
        private files;
        private dispatcher;
        constructor(parserFactory?: ParserFactory, processFactory?: ProcessFactory, files?: Filesystem, dispatcher?: EventEmitter);
        run(path: string, params: string[], opts: RunnerOptions): Promise<TestCase[]>;
        on(name: string | symbol, callback: any): Runner;
        private getConfiguration(cwd, rootPath);
        private getExecutable(execPath, cwd, rootPath);
    }
}
declare module "index" {
    export * from "runner";
    export * from "parsers";
    export * from "process";
    export * from "filesystem";
    export * from "xml-parsers";
}
