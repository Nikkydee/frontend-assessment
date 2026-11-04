import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

export class LoginPage extends PageBase {

    // Locators
    readonly pageHeading: Locator;
    readonly emailField: Locator;
    readonly passwordField: Locator;
    readonly submitBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.pageHeading = page.getByRole('heading', { name: 'Login to your 78MFB account' });
        this.emailField = page.getByTestId('login-email');
        this.passwordField = page.getByTestId('login-password');
        this.submitBtn = page.getByTestId('login-submit');
    }

    async open(): Promise<void> {
        await this.navigateTo('/');
        await this.pageHeading.waitFor({ state: 'visible' });
    }

    async fillCredentials(email: string, password: string): Promise<void> {
        await this.fillField(this.emailField, email);
        await this.fillField(this.passwordField, password);
    }

    async clickSubmitBtn(): Promise<void> {
        await this.submitBtn.click();
    }
}
