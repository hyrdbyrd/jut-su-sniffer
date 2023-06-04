import { AxiosProgressEvent } from 'axios';

export const log = (...args: any[]) => {
    console.clear();
    console.log(...args);
};

export const devLog = (...args: any[]) => {
    if (!process.env.DEBUG) return;
    console.warn(...args);
};

const pfxses: Record<string, string> = {};
export const logProggress = (prefix: string = '') => {
    pfxses[prefix] = '';

    const pg = pgs();
    function* pgs() {
        while (true) {
            for (const item of ['-', '\\', '|', '/']) yield item;
        }
    }

    return ({ progress = 0 }: AxiosProgressEvent) => {
        const { value } = pg.next();
        pfxses[prefix] = `${prefix}${(progress * 100) | 0}% ${value}`;

        console.clear();
        for (const [_, logFor] of Object.entries(pfxses).sort(([a], [b]) => a.length - b.length)) console.log(logFor);
    };
};
