import { Page, Locator } from '@playwright/test';

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

/** Reads a required environment variable and fails fast if it is missing. */
export const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
    }
    return value;
};
