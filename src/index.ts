import { getArgv } from './cli';
import { wait } from './lib/helpers';
import { log, logProggress, logStatus } from './lib/log';
import { createFolder, uploadFile, hasFile } from './lib/cloud';

import type { Seria, Parsers } from './entity/types';
import { mkSeria, mkFilePath, mkFolderPath, mkExt, MkInput } from './entity/names';

import { jutSuParsers } from './parsers/jutsu';

const done: Seria[] = [];
const errored: Seria[] = [];

const parsersList: Parsers[] = [jutSuParsers];

(async () => {
    const { retries, input, seasonsInclude, folderPath } = await getArgv();

    log('Начинаем парсинг');

    process.on('exit', () =>
        logStatus(
            done.map((e) => e.text),
            errored.map((e) => e.text)
        )
    );

    let parsers: Parsers | null = null;
    for (const ps of parsersList) {
        parsers = ps;
        if (parsers.isRightDomain(input)) break;
    }

    const seasons = await parsers?.getSeasons(input);
    if (!seasons || !parsers) return log('Парсер не написан на этот сайт 😣');
    if (!seasonsInclude.length) seasonsInclude.push(...Object.keys(seasons).map(Number));

    log(`В качестве парсера выбран ${parsers.name}`);

    const waitFor = [];
    for (const season of seasonsInclude)
        for (const seria of seasons[season]) {
            const promise = (async () => {
                let curTry = retries;
                while (curTry--) {
                    try {
                        const src = await parsers.getMovieSrc(seria);
                        const ext = mkExt(src);

                        const opt: MkInput = { ...seria, ext };

                        const fileName = mkSeria(opt);
                        const folder = folderPath || parsers.getTitle(input);

                        const isNewFolder = await createFolder(mkFolderPath(folder, opt));
                        if (!isNewFolder && (await hasFile(folder, fileName))) return;

                        const movie = await parsers.getMovie(src, seria);

                        const isFileUploaded = await uploadFile(mkFilePath(folder, { ...opt, full: true }), movie);
                        if (!isFileUploaded) throw new Error('Not ok');

                        done.push(seria);

                        // Выходим из цепочки ретраев
                        break;
                    } catch (e) {
                        errored.push(seria);
                        await wait();
                    }
                }
            })();

            waitFor.push(promise);
        }

    logProggress.clean();

    await Promise.all(waitFor);

    process.exit();
})();
