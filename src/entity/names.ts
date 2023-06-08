import { join } from 'path/posix';

import { Seria } from './types';

export type MkInput = Seria & { full?: boolean; ext?: string };

export const mkExt = (input: string) => `.${input.split('.').at(-1) || 'mp4'}`;

export const mkFileName = (file: string | number, ext: string = '.mp4') => String(file) + ext;

export const mkSeria = ({ seria, season, full = false, href, ext = mkExt(href) }: MkInput) =>
    full ? mkFileName(`s${season}s${seria}`, ext) : mkFileName(seria, ext);

export const mkSeason = (season: number) => `S${season}`;

export const mkFolderPath = (folder: string, opt: MkInput) => join(folder, mkSeason(opt.season));

export const mkFilePath = (folder: string, opt: MkInput) => join(mkFolderPath(folder, opt), mkSeria(opt));
