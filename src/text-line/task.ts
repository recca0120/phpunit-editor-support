import { Line } from './line';

export interface Task {
    (text: string, lineNumber: number, index: number, input: string): Line;
}
