import { Filesystem } from '../filesystem';
import { JUnitParser } from './junit-parser';
import { Parser } from './parser';
import { TeamCityParser } from './teamcity-parser';
import { TextLineFactory } from '../text-line';

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
