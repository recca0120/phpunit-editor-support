import { Fault } from './fault';
import { Type } from './type';

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
