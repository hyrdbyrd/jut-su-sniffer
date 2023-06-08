import { logProggress } from './log';

const checkCalls = <T>(fn: jest.JestMatchers<T>, inputs: string[]) => {
    for (const [idx, value] of inputs.entries()) fn.toHaveBeenNthCalledWith(idx + 1, value);
};

describe('lib/log', () => {
    it('logProgress', () => {
        console.log = jest.fn();
        console.clear = jest.fn();

        const first = logProggress('first');
        const second = logProggress('second');
        const third = logProggress('third');

        first({ progress: 0 });

        second({ progress: 0.3 });

        third({ progress: 0.8 });

        first({ progress: 1 });

        checkCalls(expect(console.log), [
            'first    0% [          ]',
            'second   0% [          ]',
            'third    0% [          ]',
            'first    0% [          ]',
            'second  30% [...       ]',
            'third    0% [          ]',
            'first    0% [          ]',
            'second  30% [...       ]',
            'third   80% [........  ]',
            'first  100% [..........]',
            'second  30% [...       ]',
            'third   80% [........  ]',
        ]);

        expect(console.clear).toBeCalledTimes(4);
    });
});
