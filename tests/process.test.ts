import { Process, ProcessFactory } from '../src/process';

describe('Process Tests', () => {
    it('Process Factory', async () => {

        const factory = new ProcessFactory;
        const process = factory.create(new Process());

        process.on('stdout', (buffer: Buffer) => {
            expect(buffer.toString().trim()).toEqual('123');
        }).on('exit', (code: number) => {
            expect(code).toEqual(0);
        });

        const response: string = await process.spawn(['echo', '123']);

        expect(response).toEqual('123');
    });
});
