import { FastXmlParser, X2js as X2jsXmlParser, Xml2js as Xml2jsXmlParser } from './xml-parsers';
import { JUnitParser, TeamCityParser } from './parsers';

import { Filesystem } from './filesystem';
import { Process } from './process';
import { Runner } from './runner';

module.exports = {
    Runner,
    Filesystem,
    Process,
    TeamCityParser,
    JUnitParser,
    FastXmlParser,
    X2jsXmlParser,
    Xml2jsXmlParser,
};
