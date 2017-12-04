import { JUnitParser, Parser, TeamCityParser } from './parsers';

import { Filesystem } from './filesystem';
import { TextLineFactory } from './text-line-factory';

export class ParserFactory {
    constructor(
        protected files: Filesystem = new Filesystem(),
        protected textLineFactory: TextLineFactory = new TextLineFactory()
    ) {}

    public create(name: string): Parser {
        switch (name.toLowerCase()) {
            case 'teamcity':
                return new TeamCityParser(this.files, this.textLineFactory);
            default:
                return new JUnitParser(this.files, this.textLineFactory);
        }
    }
}
