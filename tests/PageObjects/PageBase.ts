import { Locator, Page } from '@playwright/test';

export class PageBase {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(path: string = '/'): Promise<void> {
        await this.page.goto(path);
    }

    async clearField(element: Locator): Promise<void> {
        await element.clear();
    }

    async fillField(element: Locator, value: string): Promise<void> {
        await element.waitFor({ state: 'visible' });
        await element.fill(value);
    }
}
