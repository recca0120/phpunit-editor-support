var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("helpers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isWindows() {
        return /win32|mswin(?!ce)|mingw|bccwin|cygwin/i.test(process.platform);
    }
    exports.isWindows = isWindows;
    function tap(val, callback) {
        callback(val);
        return val;
    }
    exports.tap = tap;
});
define("filesystem", ["require", "exports", "path", "helpers", "fs", "os"], function (require, exports, path_1, helpers_1, fs_1, os_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function existsSync(filePath) {
        try {
            fs_1.statSync(filePath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
        }
        return true;
    }
    function ensureArray(search) {
        return search instanceof Array ? search : [search];
    }
    var POSIX = /** @class */ (function () {
        function POSIX() {
            this.systemPaths = process.env.PATH
                .split(/:|;/g)
                .map(function (path) { return path.replace(/(:|;)$/, '').trim(); });
            this.extensions = [''];
            this.separator = '/';
        }
        POSIX.prototype.findUp = function (search, opts) {
            var cwd = Object.assign({
                cwd: process.cwd(),
            }, opts).cwd;
            var root = path_1.parse(cwd).root;
            // const basePath = opts.basePath ? pathResolve(opts.basePath) : root;
            do {
                var find = this.usePath(search, {
                    cwd: cwd,
                });
                if (find) {
                    return find;
                }
                cwd = path_1.resolve(cwd, '..');
            } while (root !== cwd);
            return this.find(search, {
                cwd: root,
            });
        };
        POSIX.prototype.find = function (search, opts) {
            return this.usePath(search, opts) || this.useSystemPath(search);
        };
        POSIX.prototype.exists = function (search, opts) {
            var _this = this;
            search = ensureArray(search);
            var cwd = Object.assign({
                cwd: process.cwd(),
            }, opts).cwd;
            var _loop_1 = function (file) {
                if (this_1.extensions.some(function (extension) { return existsSync("" + cwd + _this.separator + file + extension); }) ||
                    this_1.extensions.some(function (extension) { return existsSync("" + file + extension); })) {
                    return { value: true };
                }
            };
            var this_1 = this;
            for (var _i = 0, search_1 = search; _i < search_1.length; _i++) {
                var file = search_1[_i];
                var state_1 = _loop_1(file);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return false;
        };
        POSIX.prototype.usePath = function (search, opts) {
            search = ensureArray(search);
            var cwd = Object.assign({
                cwd: process.cwd(),
            }, opts).cwd;
            for (var _i = 0, search_2 = search; _i < search_2.length; _i++) {
                var file = search_2[_i];
                for (var _a = 0, _b = ["" + cwd + this.separator, '']; _a < _b.length; _a++) {
                    var pwd = _b[_a];
                    for (var _c = 0, _d = this.extensions; _c < _d.length; _c++) {
                        var extension = _d[_c];
                        var path = "" + pwd + file + extension;
                        if (existsSync(path) === true && this.isFile(path)) {
                            return path_1.resolve(path);
                        }
                    }
                }
            }
            return '';
        };
        POSIX.prototype.useSystemPath = function (search) {
            search = ensureArray(search);
            for (var _i = 0, _a = this.systemPaths; _i < _a.length; _i++) {
                var systemPath = _a[_i];
                var find = this.usePath(search, {
                    cwd: systemPath,
                });
                if (find) {
                    return find;
                }
            }
            return '';
        };
        POSIX.prototype.isFile = function (path) {
            return fs_1.statSync(path).isFile();
        };
        return POSIX;
    }());
    exports.POSIX = POSIX;
    var Windows = /** @class */ (function (_super) {
        __extends(Windows, _super);
        function Windows() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.systemPaths = process.env.PATH
                .split(/;/g)
                .map(function (path) { return path.replace(/(;)$/, '').trim(); });
            _this.extensions = ['.bat', '.exe', '.cmd', ''];
            _this.separator = '\\';
            return _this;
        }
        return Windows;
    }(POSIX));
    exports.Windows = Windows;
    var Cacheable = /** @class */ (function () {
        function Cacheable() {
            this.cache = new Map();
        }
        Cacheable.prototype.key = function (search, opts) {
            if (opts === void 0) { opts = []; }
            return JSON.stringify(ensureArray(search)
                .concat(opts)
                .join('-'));
        };
        return Cacheable;
    }());
    exports.Cacheable = Cacheable;
    var Filesystem = /** @class */ (function (_super) {
        __extends(Filesystem, _super);
        function Filesystem(files) {
            if (files === void 0) { files = helpers_1.isWindows() ? new Windows() : new POSIX(); }
            var _this = _super.call(this) || this;
            _this.files = files;
            return _this;
        }
        Filesystem.prototype.findUp = function (search, opts) {
            var _this = this;
            if (opts === void 0) { opts = {}; }
            var cwd = opts.cwd || process.cwd();
            var rootPath = opts.rootPath || '';
            var key = this.key(search, [cwd, rootPath]);
            return this.cache.has(key) === true
                ? this.cache.get(key)
                : helpers_1.tap(this.files.findUp(search, opts), function (find) { return _this.cache.set(key, find); });
        };
        Filesystem.prototype.find = function (search, opts) {
            var _this = this;
            if (opts === void 0) { opts = {}; }
            var cwd = opts.cwd || process.cwd();
            var key = this.key(search, [cwd]);
            return this.cache.has(key) === true
                ? this.cache.get(key)
                : helpers_1.tap(this.files.find(search, opts), function (find) { return _this.cache.set(key, find); });
        };
        Filesystem.prototype.exists = function (search, opts) {
            var _this = this;
            if (opts === void 0) { opts = {}; }
            var cwd = opts.cwd || process.cwd();
            var key = this.key(search, [cwd, 'exists']);
            return this.cache.has(key) === true
                ? this.cache.get(key)
                : helpers_1.tap(this.files.exists(search, opts), function (find) { return _this.cache.set(key, find); });
        };
        Filesystem.prototype.get = function (path) {
            return fs_1.readFileSync(path).toString();
        };
        Filesystem.prototype.getAsync = function (path, encoding) {
            if (encoding === void 0) { encoding = 'utf8'; }
            return new Promise(function (resolve, reject) {
                fs_1.readFile(path, encoding, function (error, data) {
                    return error ? reject(error) : resolve(data);
                });
            });
        };
        Filesystem.prototype.unlink = function (file) {
            var _this = this;
            try {
                if (existsSync(file) === true) {
                    fs_1.unlinkSync(file);
                }
            }
            catch (e) {
                setTimeout(function () {
                    _this.unlink(file);
                }, 500);
            }
        };
        Filesystem.prototype.tmpfile = function (tmpname, dir) {
            if (dir === void 0) { dir = ''; }
            return path_1.resolve(!dir ? os_1.tmpdir() : dir, tmpname);
        };
        Filesystem.prototype.isFile = function (path) {
            return fs_1.statSync(path).isFile();
        };
        Filesystem.prototype.dirname = function (path) {
            return path_1.dirname(path);
        };
        return Filesystem;
    }(Cacheable));
    exports.Filesystem = Filesystem;
});
define("xml-parsers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FastXmlParser = /** @class */ (function () {
        function FastXmlParser() {
        }
        FastXmlParser.prototype.parse = function (content) {
            return new Promise(function (resolve) {
                resolve(require('fast-xml-parser').parse(content, {
                    attrPrefix: '_',
                    textNodeName: '__text',
                    ignoreNonTextNodeAttr: false,
                    ignoreTextNodeAttr: false,
                    ignoreNameSpace: false,
                }));
            });
        };
        FastXmlParser.prototype.map = function (testCaseNode) {
            return testCaseNode;
        };
        return FastXmlParser;
    }());
    exports.FastXmlParser = FastXmlParser;
    var X2jsParser = /** @class */ (function () {
        function X2jsParser() {
        }
        X2jsParser.prototype.parse = function (content) {
            var x2js = require('x2js');
            return new Promise(function (resolve) {
                resolve(new x2js({
                    enableToStringFunc: false,
                }).xml2js(content));
            });
        };
        X2jsParser.prototype.map = function (testCaseNode) {
            return testCaseNode;
        };
        return X2jsParser;
    }());
    exports.X2jsParser = X2jsParser;
    var Xml2jsParser = /** @class */ (function () {
        function Xml2jsParser() {
        }
        Xml2jsParser.prototype.parse = function (content) {
            return new Promise(function (resolve, reject) {
                require('xml2js').parseString(content, { trim: true, async: true }, function (error, result) {
                    error ? reject(error) : resolve(result);
                });
            });
        };
        Xml2jsParser.prototype.map = function (testCaseNode) {
            var node = {
                _name: testCaseNode.$.name,
                _class: testCaseNode.$.class,
                _classname: testCaseNode.$.classname,
                _file: testCaseNode.$.file,
                _line: testCaseNode.$.line,
                _assertions: testCaseNode.$.assertions,
                _time: testCaseNode.$.time,
            };
            var errorAttribute = Object.keys(testCaseNode).filter(function (key) { return key.indexOf('$') === -1; });
            if (errorAttribute.length > 0) {
                node[errorAttribute[0]] = this.faultNode(testCaseNode[errorAttribute[0]]);
            }
            return node;
        };
        Xml2jsParser.prototype.faultNode = function (faultNode) {
            var node = faultNode[0];
            return node === ''
                ? ''
                : {
                    _type: node.$.type,
                    __text: node._,
                };
        };
        return Xml2jsParser;
    }());
    exports.Xml2jsParser = Xml2jsParser;
});
define("text-line", ["require", "exports", "filesystem"], function (require, exports, filesystem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextLineFactory = /** @class */ (function () {
        function TextLineFactory(files) {
            if (files === void 0) { files = new filesystem_1.Filesystem(); }
            this.files = files;
        }
        TextLineFactory.prototype.search = function (content, pattern, toTextLine) {
            var _this = this;
            if (toTextLine === void 0) { toTextLine = this.toTextLine; }
            return new Promise(function (resolve) {
                var results = [];
                if (pattern.flags.indexOf('g') !== -1) {
                    var match = void 0;
                    while ((match = pattern.exec(content)) !== null) {
                        var _a = _this.parseRegExpExecArray(match), text = _a.text, lineNumber = _a.lineNumber, index = _a.index, input = _a.input;
                        results.push(_this.createTextLine(toTextLine(text, lineNumber, index, input)));
                    }
                }
                else {
                    var match = pattern.exec(content);
                    if (match === null) {
                        return resolve(results);
                    }
                    var _b = _this.parseRegExpExecArray(match), text = _b.text, lineNumber = _b.lineNumber, index = _b.index, input = _b.input;
                    results.push(_this.createTextLine(toTextLine(text, lineNumber, index, input)));
                }
                resolve(results.filter(function (item) { return item.lineNumber !== 0; }));
            });
        };
        TextLineFactory.prototype.searchFile = function (file, pattern, toTextLine) {
            var _this = this;
            if (toTextLine === void 0) { toTextLine = this.toTextLine; }
            return this.getContent(file).then(function (content) { return _this.search(content, pattern, toTextLine); });
        };
        TextLineFactory.prototype.createTextLine = function (line) {
            var lineNumber = line.lineNumber, text = line.text;
            var firstNonWhitespaceCharacterIndex = text.search(/\S|$/);
            return {
                lineNumber: lineNumber,
                text: text,
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
        };
        TextLineFactory.prototype.getContent = function (file) {
            return this.files.getAsync(file).then(function (content) {
                return Promise.resolve(content);
            });
        };
        TextLineFactory.prototype.toTextLine = function (text, lineNumber) {
            return {
                lineNumber: lineNumber,
                text: text,
            };
        };
        TextLineFactory.prototype.parseRegExpExecArray = function (match) {
            var text = match[0];
            var index = match.index;
            var input = match.input;
            var lineNumber = input.substr(0, index).split(/\n/).length - 1;
            return {
                text: text,
                lineNumber: lineNumber,
                index: index,
                input: input,
            };
        };
        return TextLineFactory;
    }());
    exports.TextLineFactory = TextLineFactory;
});
define("parsers", ["require", "exports", "xml-parsers", "text-line", "filesystem", "helpers"], function (require, exports, xml_parsers_1, text_line_1, filesystem_2, helpers_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Type;
    (function (Type) {
        Type["PASSED"] = "passed";
        Type["ERROR"] = "error";
        Type["WARNING"] = "warning";
        Type["FAILURE"] = "failure";
        Type["INCOMPLETE"] = "incomplete";
        Type["RISKY"] = "risky";
        Type["SKIPPED"] = "skipped";
        Type["FAILED"] = "failed";
    })(Type = exports.Type || (exports.Type = {}));
    var Parser = /** @class */ (function () {
        function Parser(files, textLineFactory) {
            if (files === void 0) { files = new filesystem_2.Filesystem(); }
            if (textLineFactory === void 0) { textLineFactory = new text_line_1.TextLineFactory(); }
            this.files = files;
            this.textLineFactory = textLineFactory;
        }
        Parser.prototype.parseFile = function (path) {
            var _this = this;
            return this.files.getAsync(path).then(function (content) { return _this.parseString(content); });
        };
        Parser.prototype.currentFile = function (details, testCase) {
            return (details.find(function (detail) { return testCase.file === detail.file && testCase.line !== detail.line; }) || {
                file: testCase.file,
                line: testCase.line,
            });
        };
        Parser.prototype.filterDetails = function (details, currentFile) {
            return details.filter(function (detail) { return detail.file !== currentFile.file && currentFile.line !== detail.line; });
        };
        Parser.prototype.parseDetails = function (content) {
            return content
                .split('\n')
                .map(function (line) { return line.trim(); })
                .filter(function (line) { return /(.*):(\d+)$/.test(line); })
                .map(function (path) {
                var _a = path.match(/(.*):(\d+)/), file = _a[1], line = _a[2];
                return {
                    file: file.trim(),
                    line: parseInt(line, 10),
                };
            });
        };
        Parser.prototype.textLine = function (file, pattern) {
            return this.textLineFactory.searchFile(file, pattern);
        };
        return Parser;
    }());
    exports.Parser = Parser;
    var JUnitParser = /** @class */ (function (_super) {
        __extends(JUnitParser, _super);
        function JUnitParser(files, textLineFactory, xmlParser) {
            if (files === void 0) { files = new filesystem_2.Filesystem(); }
            if (textLineFactory === void 0) { textLineFactory = new text_line_1.TextLineFactory(); }
            if (xmlParser === void 0) { xmlParser = new xml_parsers_1.FastXmlParser(); }
            var _this = _super.call(this, files, textLineFactory) || this;
            _this.files = files;
            _this.textLineFactory = textLineFactory;
            _this.xmlParser = xmlParser;
            return _this;
        }
        JUnitParser.prototype.parse = function (path) {
            return this.parseFile(path);
        };
        JUnitParser.prototype.parseString = function (content) {
            var _this = this;
            return this.xmlParser.parse(content).then(function (json) { return _this.parseTestSuite(json.testsuites); });
        };
        JUnitParser.prototype.parseTestSuite = function (testSuiteNode) {
            if (testSuiteNode.testsuite) {
                return testSuiteNode.testsuite instanceof Array
                    ? Promise.all([].concat.apply([], testSuiteNode.testsuite.map(this.parseTestSuite.bind(this)))).then(function (items) {
                        return items.reduce(function (prev, next) { return prev.concat(next); }, []);
                    })
                    : this.parseTestSuite(testSuiteNode.testsuite);
            }
            return testSuiteNode.testcase instanceof Array
                ? Promise.all([].concat.apply([], testSuiteNode.testcase.map(this.parseTestCase.bind(this))))
                : Promise.all([this.parseTestCase(testSuiteNode.testcase)]);
        };
        JUnitParser.prototype.parseTestCase = function (testCaseNode) {
            testCaseNode = this.xmlParser.map(testCaseNode);
            var testCase = {
                name: testCaseNode._name || null,
                class: testCaseNode._class,
                classname: testCaseNode._classname || null,
                file: testCaseNode._file,
                line: parseInt(testCaseNode._line || 1, 10),
                time: parseFloat(testCaseNode._time || 0),
                type: Type.PASSED,
            };
            var faultNode = this.getFaultNode(testCaseNode);
            if (faultNode === null) {
                return Promise.resolve(testCase);
            }
            var details = this.parseDetails(faultNode.__text);
            var currentFile = this.currentFile(details, testCase);
            var message = this.parseMessage(faultNode, details);
            return Promise.resolve(Object.assign(testCase, currentFile, {
                type: faultNode.type,
                fault: {
                    type: faultNode._type || '',
                    message: message,
                    details: this.filterDetails(details, currentFile),
                },
            }));
        };
        JUnitParser.prototype.getFaultNode = function (testCaseNode) {
            var _this = this;
            var keys = Object.keys(testCaseNode);
            if (keys.indexOf('error') !== -1) {
                return helpers_2.tap(testCaseNode.error, function (error) {
                    error.type = _this.parseErrorType(error);
                });
            }
            if (keys.indexOf('warning') !== -1) {
                return helpers_2.tap(testCaseNode.warning, function (warning) {
                    warning.type = Type.WARNING;
                });
            }
            if (keys.indexOf('failure') !== -1) {
                return helpers_2.tap(testCaseNode.failure, function (failure) {
                    failure.type = Type.FAILURE;
                });
            }
            if (keys.indexOf('skipped') !== -1) {
                return {
                    type: Type.SKIPPED,
                    _type: Type.SKIPPED,
                    __text: '',
                };
            }
            if (keys.indexOf('incomplete') !== -1) {
                return {
                    type: Type.INCOMPLETE,
                    _type: Type.INCOMPLETE,
                    __text: '',
                };
            }
            return null;
        };
        JUnitParser.prototype.parseMessage = function (faultNode, details) {
            var messages = details
                .reduce(function (result, detail) {
                return result.replace(detail.file + ":" + detail.line, '').trim();
            }, this.normalize(faultNode.__text))
                .split(/\r\n|\n/);
            var message = messages.length === 1 ? messages[0] : messages.slice(1).join('\n');
            return faultNode._type ? message.replace(new RegExp("^" + faultNode._type + ":", 'g'), '').trim() : message.trim();
        };
        JUnitParser.prototype.parseErrorType = function (errorNode) {
            var errorType = errorNode._type.toLowerCase();
            return ([Type.WARNING, Type.FAILURE, Type.INCOMPLETE, Type.RISKY, Type.SKIPPED, Type.FAILED].find(function (type) { return errorType.indexOf(type) !== -1; }) || Type.ERROR);
        };
        JUnitParser.prototype.normalize = function (content) {
            return content.replace(/\r\n/g, '\n').replace(/&#13;/g, '');
        };
        return JUnitParser;
    }(Parser));
    exports.JUnitParser = JUnitParser;
    var TeamCityParser = /** @class */ (function (_super) {
        __extends(TeamCityParser, _super);
        function TeamCityParser() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.typeMap = {
                testPassed: Type.PASSED,
                testFailed: Type.FAILURE,
                testIgnored: Type.SKIPPED,
            };
            return _this;
        }
        TeamCityParser.prototype.parse = function (content) {
            return this.parseString(content);
        };
        TeamCityParser.prototype.parseString = function (content) {
            var _this = this;
            return Promise.all(this.groupByType(this.parseTeamCity(content)).map(function (group) { return _this.parseTestCase(group); }));
        };
        TeamCityParser.prototype.parseTestCase = function (group) {
            if (group.length === 2) {
                group.splice(1, 0, {
                    eventName: 'testPassed',
                });
            }
            var start = group[0], error = group[1], finish = group[2];
            var _a = start.locationHint
                .replace(/php_qn:\/\//g, '')
                .replace(/::\\/g, '::')
                .split('::'), file = _a[0], className = _a[1], name = _a[2];
            var type = this.typeMap[error.eventName];
            var testCase = {
                name: name,
                class: className.substr(className.lastIndexOf('\\') + 1),
                classname: null,
                file: file,
                line: 0,
                time: parseFloat(finish.duration) / 1000,
                type: type,
            };
            if (type !== Type.PASSED) {
                var details = this.parseDetails(error.details);
                var currentFile = this.currentFile(details, testCase);
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
            var pattern = new RegExp(" *public\\s+function\\s+" + name + "\\s*\\(.*");
            return this.textLine(file, pattern).then(function (items) {
                var textLine = items.length > 0
                    ? items[0]
                    : {
                        lineNumber: 0,
                    };
                return Object.assign(testCase, {
                    line: textLine.lineNumber + 1,
                });
            });
        };
        TeamCityParser.prototype.parseTeamCity = function (content) {
            return content
                .split(/\r|\n/)
                .filter(function (line) { return /^##teamcity/.test(line); })
                .map(function (line) {
                line = line
                    .trim()
                    .replace(/^##teamcity\[|\]$/g, '')
                    .replace(/\\/g, '||')
                    .replace(/\|\'/g, "\\'");
                var argv = require('minimist-string')(line)._;
                var teamCity = {
                    eventName: argv.shift(),
                };
                return argv.reduce(function (options, arg) {
                    return helpers_2.tap(options, function (opts) {
                        var split = arg.split('=');
                        var key = split.shift();
                        var value = split
                            .join('=')
                            .replace(/\|\|/g, '\\')
                            .replace(/\|n/g, '\n')
                            .trim();
                        opts[key] = value;
                    });
                }, teamCity);
            })
                .filter(function (item) { return ['testCount', 'testSuiteStarted', 'testSuiteFinished'].indexOf(item.eventName) === -1; });
        };
        TeamCityParser.prototype.groupByType = function (items) {
            var counter = 0;
            return items.reduce(function (results, item) {
                if (!results[counter]) {
                    results[counter] = [];
                }
                results[counter].push(item);
                if (item.eventName === 'testFinished') {
                    counter++;
                }
                return results;
            }, []);
        };
        return TeamCityParser;
    }(Parser));
    exports.TeamCityParser = TeamCityParser;
    var ParserFactory = /** @class */ (function () {
        function ParserFactory(files, textLineFactory) {
            if (files === void 0) { files = new filesystem_2.Filesystem(); }
            if (textLineFactory === void 0) { textLineFactory = new text_line_1.TextLineFactory(); }
            this.files = files;
            this.textLineFactory = textLineFactory;
        }
        ParserFactory.prototype.create = function (name) {
            switch (name.toLowerCase()) {
                case 'teamcity':
                    return new TeamCityParser(this.files, this.textLineFactory);
                default:
                    return new JUnitParser(this.files, this.textLineFactory);
            }
        };
        return ParserFactory;
    }());
    exports.ParserFactory = ParserFactory;
});
define("process", ["require", "exports", "child_process", "events", "helpers"], function (require, exports, child_process_1, events_1, helpers_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Process = /** @class */ (function () {
        function Process(dispatcher) {
            if (dispatcher === void 0) { dispatcher = new events_1.EventEmitter(); }
            this.dispatcher = dispatcher;
        }
        Process.prototype.spawn = function (parameters, options) {
            var _this = this;
            return new Promise(function (resolve) {
                var command = parameters.shift() || '';
                var output = [];
                return helpers_3.tap(child_process_1.spawn(command, parameters, options), function (process) {
                    process.stdout.on('data', function (buffer) {
                        output.push(buffer);
                        _this.dispatcher.emit('stdout', buffer);
                    });
                    process.stderr.on('data', function (buffer) {
                        _this.dispatcher.emit('stderr', buffer);
                    });
                    process.on('exit', function (code) {
                        _this.dispatcher.emit('exit', code);
                        resolve(output.map(function (buffer) { return buffer.toString(); }).join('').replace(/\n$/, ''));
                    });
                });
            });
        };
        Process.prototype.on = function (name, callback) {
            this.dispatcher.on(name, callback);
            return this;
        };
        return Process;
    }());
    exports.Process = Process;
    var ProcessFactory = /** @class */ (function () {
        function ProcessFactory() {
        }
        ProcessFactory.prototype.create = function (process) {
            if (process === void 0) { process = new Process; }
            return process;
        };
        return ProcessFactory;
    }());
    exports.ProcessFactory = ProcessFactory;
});
define("runner", ["require", "exports", "events", "filesystem", "parsers", "process", "path", "helpers"], function (require, exports, events_2, filesystem_3, parsers_1, process_1, path_2, helpers_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var minimist = require('minimist');
    var State;
    (function (State) {
        State["PHPUNIT_GIT_FILE"] = "phpunit_git_file";
        State["PHPUNIT_NOT_FOUND"] = "phpunit_not_found";
        State["PHPUNIT_EXECUTE_ERROR"] = "phpunit_execute_error";
        State["PHPUNIT_NOT_TESTCASE"] = "phpunit_not_testcase";
        State["PHPUNIT_NOT_PHP"] = "phpunit_not_php";
    })(State = exports.State || (exports.State = {}));
    var RunnerParams = /** @class */ (function () {
        function RunnerParams(options) {
            if (options === void 0) { options = []; }
            this.options = this.parseOptions(options);
        }
        RunnerParams.prototype.has = function (key) {
            return !!this.options[this.normalizeKey(key)];
        };
        RunnerParams.prototype.put = function (key, value) {
            this.options[this.normalizeKey(key)] = value;
            return this;
        };
        RunnerParams.prototype.get = function (key) {
            return this.options[this.normalizeKey(key)];
        };
        RunnerParams.prototype.remove = function (key) {
            delete this.options[this.normalizeKey(key)];
        };
        RunnerParams.prototype.toParams = function () {
            var _this = this;
            return helpers_4.tap(Object.keys(this.options).filter(function (key) { return key !== '_'; }), function (keys) {
                keys.sort();
            }).reduce(function (prev, key) {
                var k = key.length === 1 ? "-" + key : "--" + key;
                var value = _this.get(key);
                if (['d', 'include-path'].indexOf(key) === -1 && value instanceof Array) {
                    value = value[value.length - 1];
                }
                if (key === 'colors') {
                    return prev.concat("--colors=" + value);
                }
                if (value === true) {
                    return prev.concat([k]);
                }
                if (!value) {
                    return prev;
                }
                return value instanceof Array
                    ? value.reduce(function (opts, v) {
                        return opts.concat([k, v]);
                    }, prev)
                    : prev.concat([k, value]);
            }, this.options._);
        };
        RunnerParams.prototype.normalizeKey = function (key) {
            return key.replace(/^-+/g, '');
        };
        RunnerParams.prototype.parseOptions = function (opts) {
            return helpers_4.tap(minimist(opts, {
                boolean: ['teamcity'],
            }), function (options) {
                options['log-junit'] = false;
                if (options['c'] || options['configuration']) {
                    options['c'] = options['c'] || options['configuration'];
                    options['configuration'] = false;
                }
            });
        };
        return RunnerParams;
    }());
    exports.RunnerParams = RunnerParams;
    var Runner = /** @class */ (function () {
        function Runner(parserFactory, processFactory, files, dispatcher) {
            if (parserFactory === void 0) { parserFactory = new parsers_1.ParserFactory(); }
            if (processFactory === void 0) { processFactory = new process_1.ProcessFactory(); }
            if (files === void 0) { files = new filesystem_3.Filesystem(); }
            if (dispatcher === void 0) { dispatcher = new events_2.EventEmitter(); }
            this.parserFactory = parserFactory;
            this.processFactory = processFactory;
            this.files = files;
            this.dispatcher = dispatcher;
        }
        Runner.prototype.run = function (path, params, opts) {
            var _this = this;
            var _a = Object.assign({
                rootPath: __dirname,
                execPath: '',
            }, opts), rootPath = _a.rootPath, execPath = _a.execPath;
            var cwd = this.files.isFile(path) ? this.files.dirname(path) : path;
            var runnerParams = new RunnerParams(params);
            return new Promise(function (resolve, reject) {
                if (runnerParams.has('--teamcity') === false) {
                    runnerParams.put('--log-junit', _this.files.tmpfile("vscode-phpunit-junit-" + new Date().getTime() + ".xml"));
                }
                var executable = _this.getExecutable(execPath, cwd, rootPath);
                if (runnerParams.has('-c') === false) {
                    runnerParams.put('-c', _this.getConfiguration(path_2.dirname(executable), rootPath) || false);
                }
                var spawnOptions = [executable].concat(runnerParams.toParams()).concat([path]);
                _this.dispatcher.emit('command', spawnOptions.join(' '));
                _this.processFactory
                    .create()
                    .on('stdout', function (buffer) { return _this.dispatcher.emit('stdout', buffer); })
                    .on('stderr', function (buffer) { return _this.dispatcher.emit('stderr', buffer); })
                    .spawn(spawnOptions, {
                    cwd: rootPath,
                })
                    .then(function (output) {
                    _this.dispatcher.emit('exit', output);
                    var parser = _this.parserFactory.create(runnerParams.has('--teamcity') ? 'teamcity' : 'junit');
                    var content = runnerParams.has('--teamcity') ? output : runnerParams.get('--log-junit');
                    parser
                        .parse(content)
                        .then(function (items) {
                        if (runnerParams.has('--log-junit')) {
                            _this.files.unlink(runnerParams.get('--log-junit'));
                        }
                        resolve(items);
                    })
                        .catch(function (error) { return reject(error); });
                });
            });
        };
        Runner.prototype.on = function (name, callback) {
            this.dispatcher.on(name, callback);
            return this;
        };
        Runner.prototype.getConfiguration = function (cwd, rootPath) {
            return this.files.findUp(['phpunit.xml', 'phpunit.xml.dist'], { cwd: cwd, rootPath: rootPath });
        };
        Runner.prototype.getExecutable = function (execPath, cwd, rootPath) {
            var path = this.files.findUp([execPath, "vendor/bin/phpunit", "phpunit.phar", 'phpunit'].filter(function (path) { return path !== ''; }), { cwd: cwd, rootPath: rootPath });
            if (!path) {
                throw State.PHPUNIT_NOT_FOUND;
            }
            return path;
        };
        return Runner;
    }());
    exports.Runner = Runner;
});
define("index", ["require", "exports", "runner", "parsers", "process", "filesystem", "xml-parsers"], function (require, exports, runner_1, parsers_2, process_2, filesystem_4, xml_parsers_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(runner_1);
    __export(parsers_2);
    __export(process_2);
    __export(filesystem_4);
    __export(xml_parsers_2);
});
//# sourceMappingURL=index.js.map