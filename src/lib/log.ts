import dotenv from 'dotenv';
import { AxiosProgressEvent } from 'axios';

dotenv.config();

export const log = (...args: any[]) => {
    !process.env.DEBUG && console.clear();
    console.log(...args);
};

export const devLog = (...args: any[]) => {
    if (!process.env.DEBUG) return;
    console.warn(...args);
};

export const logStatus = (done: string[], errored: string[]) => {
    if (done.length || errored.length) {
        log(`
Завершено ✅: ${['', ...done].join('\n    ')}

Упало ❌: ${['', ...errored].join('\n    ')}
    `);
    }

    log('Что-то пошло не так - ничего загружалось вовсе');
};

export const logProggress = (() => {
    const pfxses: Record<string, number> = {};
    const pfxsesList: string[] = [];

    const mkPercent = (p: number) => `${p}%`;
    const mkPrefix = (pfx: string, percent: number) => {
        const prefix = pfx.padEnd(Math.max(...Object.keys(pfxses).map((e) => e.length)), ' ');
        const pr = mkPercent(percent).padStart(4, ' ');

        return `${prefix} ${pr}`;
    };

    function resultFn(prefix: string = '') {
        pfxses[prefix] = 0;
        pfxsesList.push(prefix);

        function progress({ progress = 0 }: Partial<AxiosProgressEvent>) {
            pfxses[prefix] = (progress * 100) | 0;

            console.clear();
            for (const pf of pfxsesList) {
                const percent = pfxses[pf];
                console.log(`${mkPrefix(pf, percent)} [${'.'.repeat(Math.min(percent / 10, 10)).padEnd(10, ' ')}]`);
            }
        }

        progress.prefix = prefix;
        progress.cleanPrefix = () => {
            const idx = pfxsesList.indexOf(prefix);
            idx !== -1 && pfxsesList.splice(idx, 1);

            delete pfxses[prefix];
        };

        return progress;
    }

    resultFn.getPrefixes = () => JSON.parse(JSON.stringify(pfxses));
    resultFn.clean = () => {
        for (const key in pfxses) delete pfxses[key];
        pfxsesList.splice(0, pfxsesList.length);
    };

    return resultFn;
})();
