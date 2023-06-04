import { Stream } from 'stream';

import { mkSeria } from '../entity/names';
import {
    Seria,
    Parsers,
    Seasons,
    GetTitle,
    GetMovieFn,
    GetSeasonsFn,
    IsRightDomain,
    GetMovieSrcFn,
} from '../entity/types';

import { html, load } from '../lib/html';
import { devLog, logProggress } from '../lib/log';

const getSeasons: GetSeasonsFn = (input: string): Promise<Seasons | null> => {
    if (!String(input).startsWith('https://jut.su/')) return Promise.resolve(null);

    const url = new URL(String(input));
    url.pathname = url.pathname.split('/').filter(Boolean)[0]!;

    return html
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
        )
        .catch((error) => {
            devLog('Не удалось получить сезоны и серии');
            throw new Error(error);
        });
};

const getMovieSrc: GetMovieSrcFn = async (seria: Seria) => {
    const url = new URL('https://jut.su/');
    url.pathname = seria.href;

    return await html
        .get(url.toString())
        .then(load)
        .then(($) =>
            String(
                $('video source[label*="1080"]')
                    .map((i, e) => $(e).attr().src)
                    .get(0)
            )
        );
};

const getMovie: GetMovieFn = async (src: string, seria: Seria) =>
    html
        .get<Stream>(src, {
            responseType: 'stream',
            onDownloadProgress: logProggress(`Загружаем ${mkSeria({ ...seria, full: true })}: `),
        })
        .then((e) => e.data);

const isRightDomain: IsRightDomain = (input: string) => /^https:\/\/jut.su\/[\w\d]+/i.test(input);

const getTitle: GetTitle = (input: string) => input.match(/^https:\/\/jut.su\/([^/]+)\/?/i)?.[1] || 'jut-su';

export const jutSuParsers: Parsers = {
    getTitle,
    getMovie,
    getSeasons,
    getMovieSrc,
    isRightDomain,
};
