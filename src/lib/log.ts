import { AxiosProgressEvent } from 'axios';

export const log = (...args: any[]) => {
    console.clear();
    console.log(...args);
};

export const devLog = (...args: any[]) => {
    if (!process.env.DEBUG) return;
    console.warn(...args);
};

export const logStatus = (done: string[], errored: string[]) =>
    log(`
Завершено ✅: ${['', ...done].join('\n    ')}

Упало ❌: ${['', ...errored].join('\n    ')}
    `);

export const logProggress = (() => {
    const pfxses: Record<string, string> = {};
    return (prefix: string = '') => {
        pfxses[prefix] = '';

        return ({ progress = 0 }: AxiosProgressEvent) => {
            pfxses[prefix] = `${prefix}${(progress * 100) | 0}%`;

            const maxLen = Math.max(...Object.values(pfxses).map((e) => e.length));

            console.clear();
            for (const [_, logFor] of Object.entries(pfxses).sort(([a], [b]) => a.length - b.length))
                console.log(
                    `${logFor.padEnd(maxLen, ' ')} [${'.'.repeat(Math.min(progress * 10, 10)).padEnd(10, ' ')}]`
                );
        };
    };
})();
