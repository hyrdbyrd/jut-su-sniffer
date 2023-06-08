import type { Stream } from 'stream';

export interface Seria {
    text: string;
    href: string;
    seria: number;
    season: number;
}

export type Seasons = Record<number, Seria[]>;

export type GetTitle = (input: string) => string;
export type IsRightDomain = (input: string) => boolean;
export type GetMovieSrcFn = (seria: Seria) => Promise<string>;
export type GetSeasonsFn = (input: string) => Promise<Seasons | null>;
export type GetMovieFn = (src: string, seria: Seria) => Promise<Stream>;

export interface ParseFns {
    name: string;
    getTitle: GetTitle;
    getMovie: GetMovieFn;
    getSeasons: GetSeasonsFn;
    getMovieSrc: GetMovieSrcFn;
    isRightDomain: IsRightDomain;
}

export type Parsers = ParseFns;
