export interface XmlParser {
    parse(content: string): Promise<any>;
    map(testCaseNode: any): any;
}
