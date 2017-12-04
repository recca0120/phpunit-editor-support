import { XmlParser } from './xml-parser';

export class FastXmlParser implements XmlParser {
    parse(content: string): Promise<any> {
        return new Promise(resolve => {
            resolve(
                require('fast-xml-parser').parse(content, {
                    attrPrefix: '_',
                    textNodeName: '__text',
                    ignoreNonTextNodeAttr: false,
                    ignoreTextNodeAttr: false,
                    ignoreNameSpace: false,
                })
            );
        });
    }

    map(testCaseNode: any): any {
        return testCaseNode;
    }
}
