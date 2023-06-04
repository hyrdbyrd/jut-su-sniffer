import axios from 'axios';
import cheerio from 'cheerio';
import { join } from 'path';
import { Iconv } from 'iconv';
import { Stream } from 'form-data';

import yargs from 'yargs';

import { logProggress, log } from './log';
import { createFolder, uploadFile, hasFile } from './cloud';

const winDecoder = Iconv('windows-1251', 'utf-8');
const load = (e: any) => cheerio.load(winDecoder.convert(e.data));
const html = axios.create({
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
    headers: {
        'Content-Type': 'text/html;charset=utf-8',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7;charset=utf-8',
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'ru,en;q=0.9',
    },
});

type Seria = { seria: number; text: string; href: string; season: number };

const errored: Seria[] = [];
const done: Seria[] = [];

(async () => {
    const {
        seasons: seasonsInclude = [],
        _: [input],
        path = 'jut-su-sniffer',
    } = await yargs
        .usage('\nUsage: jut-su-sniff https://jut.su/onepunchman/')
        .option('path', { alias: 'p', describe: 'Upload path', string: true })
        .option('seasons', { alias: 'ss', describe: 'Season include', array: true, number: true })
        .help(true).argv;

    if (!String(input)?.startsWith('https://jut.su/')) {
        return console.error('Url is not starts with https://jut.su/');
    }

    process.on('exit', () => {
        log(`
Завершено ✅: ${['', ...done.map(({ text }) => text)].join('\n    ')}

Упало ❌: ${['', ...errored.map(({ text }) => text)].join('\n    ')}
        `);
    });

    const url = new URL(String(input));
    url.pathname = url.pathname.split('/').filter(Boolean)[0]!;

    const seasons = await html
        .get(url.toString())
        .then(load)
        .then(
            ($) =>
                $('.watch_l .sector_border ~ div h2 ~ a')
                    .map((idx, elem) => ({ text: $(elem).text().trim() || '', href: $(elem).attr('href') || '' }))
                    .get() as Array<{ text: string; href: string }>
        )
        .then((data) =>
            data.reduce<Record<string, Seria[]>>((acc, cur) => {
                const [season, seria] = cur.text
                    .split(' ')
                    .filter(Boolean)
                    .filter((e) => !isNaN(Number(e)));

                if (!acc[season]) acc[season] = [];
                acc[season].push({ seria: Number(seria), season: Number(season), ...cur });
                return acc;
            }, {})
        );

    if (!seasonsInclude.length) seasonsInclude.push(...Object.keys(seasons).map(Number));

    const waitFor = [];

    for (const season of seasonsInclude) {
        const serias = seasons[season];

        for (const seria of serias) {
            const { text, href } = seria;

            const promise = (async () => {
                const fileName = `${text}.mp4`;
                const folderPath = join(path, `Season ${season}`);

                const isNewFolder = await createFolder(folderPath);
                if (!isNewFolder && (await hasFile(folderPath, fileName))) return;

                url.pathname = href;

                const src: string = await html
                    .get(url.toString())
                    .then(load)
                    .then(($) =>
                        $('video source[label*="1080"]')
                            .map((i, e) => $(e).attr().src)
                            .get(0)
                    );

                const blob = await html
                    .get<Stream>(src, {
                        responseType: 'stream',
                        // @ts-ignore
                        onDownloadProgress: logProggress(`Download ${text}: `),
                    })
                    .then((e) => e.data);

                const isOk = await uploadFile(join(path, `Season ${season}`, text + '.mp4'), blob);
                if (!isOk) throw new Error('Not ok');

                done.push(seria);
            })().catch(() => {
                errored.push(seria);
            });

            waitFor.push(promise);
        }
    }

    await Promise.all(waitFor);

    process.exit();
})();
