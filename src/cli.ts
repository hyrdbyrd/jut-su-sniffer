import yargs from 'yargs';

export const getArgv = async () => {
    const {
        _: [input],
        retries = 1,
        path: folderPath,
        seasons: seasonsInclude = [],
    } = await yargs
        .usage('\nUsage: movie-disk-sniffer https://jut.su/onepunchman/')
        .option('path', { alias: 'p', describe: 'Upload path', string: true })
        .option('seasons', { alias: 'ss', describe: 'Season include', array: true, number: true })
        .option('retries', { alias: 'r', describe: 'Retries', number: true })
        .help(true).argv;

    const url = new URL(String(input));
    url.pathname = url.pathname.split('/').filter(Boolean).at(0)!;

    return {
        retries,
        folderPath,
        seasonsInclude,
        input: String(input),
    };
};
