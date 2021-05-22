import path from 'path';
import pluginTester from 'babel-plugin-tester';
import plugin from '../index';

pluginTester({
    plugin,
    pluginName: 'loop-unrolling',
    fixtures: path.join(__dirname, '__fixtures__'),
    tests: {
        identity: 'const a = [1, 2, 3].map((i) => i + 1);',
        // not support yet
        'spread-element': {
            code: `
            const identity = (...args) => args[0];
            // @loader-helper loop-unrolling
            const a = [1,2,3,4,...[5,6,7]].map(identity);
            `,
            error: true
        }
    }
});
