import { RunnerParams } from '../../src/runner';

describe('RunnerParams', () => {
    it('toParams', () => {
        const options = new RunnerParams(['--log-junit', 'test.xml', '--teamcity', '-d', 'a=b', '-d', 'c=d', 'ssh']);

        expect(options.has('--log-junit')).toBe(false);
        expect(options.has('--teamcity')).toBe(true);

        options.put('--log-junit', 'junit.xml');

        expect(options.toParams()).toEqual(['ssh', '-d', 'a=b', '-d', 'c=d', '--log-junit', 'junit.xml', '--teamcity']);
    });
});
