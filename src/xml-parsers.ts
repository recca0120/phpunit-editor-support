export interface Parser {
    parse(content: string): Promise<any>;
    map(testCaseNode: any): any;
}

export class FastXmlParser implements Parser {
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

export class X2js implements Parser {
    parse(content: string): Promise<any> {
        const x2js = require('x2js');
        return new Promise(resolve => {
            resolve(
                new x2js({
                    enableToStringFunc: false,
                }).xml2js(content)
            );
        });
    }

    map(testCaseNode: any): any {
        return testCaseNode;
    }
}

export class Xml2js implements Parser {
    parse(content: string): Promise<any> {
        return new Promise((resolve, reject) => {
            require('xml2js').parseString(content, { trim: true, async: true }, (error: any, result: any) => {
                error ? reject(error) : resolve(result);
            });
        });
    }

    map(testCaseNode: any): any {
        const node: any = {
            _name: testCaseNode.$.name,
            _class: testCaseNode.$.class,
            _classname: testCaseNode.$.classname,
            _file: testCaseNode.$.file,
            _line: testCaseNode.$.line,
            _assertions: testCaseNode.$.assertions,
            _time: testCaseNode.$.time,
        };

        const errorAttribute: string[] = Object.keys(testCaseNode).filter(key => key.indexOf('$') === -1);

        if (errorAttribute.length > 0) {
            node[errorAttribute[0]] = this.faultNode(testCaseNode[errorAttribute[0]]);
        }

        return node;
    }

    private faultNode(faultNode: any): any {
        const node = faultNode[0];

        return node === ''
            ? ''
            : {
                  _type: node.$.type,
                  __text: node._,
              };
    }
}
