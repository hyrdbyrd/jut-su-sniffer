export const createUrl = (href: string, params: Record<string, number | string>) => {
    const url = new URL(href);
    for (const [key, value] of Object.entries(params)) url.searchParams.append(key, String(value));

    return url.toString();
};
