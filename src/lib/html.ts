import axios from 'axios';
import cheerio from 'cheerio';
import { Iconv } from 'iconv';

const winDecoder = Iconv('windows-1251', 'utf-8');
export const load = (e: any) => cheerio.load(winDecoder.convert(e.data));
export const html = axios.create({
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
