import { Page, Locator, Response } from '@playwright/test';

/**
 * Clicks an element and waits for the matching API response.
 * Registering the wait before the click avoids missing a fast response.
 */
export const getResponseBody = async (path: string, page: Page, element: Locator): Promise<any> => {
    const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes(path) && res.request().method() !== 'OPTIONS'),
        element.click(),
    ]);
    return response.json();
};

/**
 * Runs a UI action and waits for the API response it triggers.
 * Returns the full Response so callers can assert on status and body.
 */
export const waitForApiResponse = async (
    page: Page,
    path: string | RegExp,
    action: () => Promise<void>,
    method: string = 'POST',
): Promise<Response> => {
    const [response] = await Promise.all([
        page.waitForResponse(res =>
            res.request().method() === method &&
            (typeof path === 'string' ? res.url().includes(path) : path.test(res.url()))),
        action(),
    ]);
    return response;
};

/** Reads a required environment variable and fails fast if it is missing. */
export const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
    }
    return value;
};

/**
 * Starts waiting for an API response without triggering anything.
 * Register it before the UI action that fires the request, then await it afterwards.
 */
export const expectApiResponse = (page: Page, path: string | RegExp, method: string = 'GET'): Promise<Response> =>
    page.waitForResponse(res =>
        res.request().method() === method &&
        (typeof path === 'string' ? res.url().includes(path) : path.test(res.url())));

/** Formats a number the way the app displays money, e.g. 1000 -> "1,000.00". */
export const formatAmount = (amount: number): string =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
