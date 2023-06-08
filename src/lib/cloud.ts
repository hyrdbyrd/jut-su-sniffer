import dotenv from 'dotenv';
import { parse } from 'url';
import { request } from 'https';
import { Stream } from 'stream';
import axios, { Method } from 'axios';

import { createUrl } from './url';

dotenv.config();

const fetch = axios.create({
    headers: {
        Authorization: `OAuth ${process.env.DISK_TOKEN}`,
    },
});

export const hasFile = (folderPath: string, fileName: string) =>
    fetch
        .get<{ _embedded: { items: Array<{ name: string }> } }>(
            createUrl('https://cloud-api.yandex.net/v1/disk/resources', { path: folderPath })
        )
        .then((e) => e.data?._embedded?.items?.some((e) => e.name === fileName))
        .catch(() => false);

export const createFolder = (path: string) =>
    fetch
        .put(createUrl('https://cloud-api.yandex.net/v1/disk/resources', { path }))
        .then(() => true)
        .catch(() => false);

export const uploadFile = (path: string, blob: Stream) =>
    fetch
        .get<{ href: string; method: Method }>(
            createUrl('https://cloud-api.yandex.net/v1/disk/resources/upload', { path, overwrite: 'true' })
        )
        .then(
            (e) =>
                new Promise<boolean>((resolve) => {
                    const uploadStream = request({ ...parse(e.data.href), method: e.data.method });

                    blob.pipe(uploadStream);
                    blob.on('end', () => {
                        uploadStream.end();
                        resolve(true);
                    });
                })
        )
        .catch(() => false);
