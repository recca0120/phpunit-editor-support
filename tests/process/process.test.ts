import { Process } from '../../src/process';

describe('Process', () => {
    it('spawn', async () => {
        const process = new Process();

        process
            .on('stdout', (buffer: Buffer) => {
                expect(buffer.toString().trim()).toEqual('123');
            })
            .on('exit', (code: number) => {
                expect(code).toEqual(0);
            });

        expect(await process.spawn(['echo', '123'])).toEqual('123');
    });
});
