import { Process } from './process';

export class ProcessFactory {
    public create(process: Process = new Process()): Process {
        return process;
    }
}
