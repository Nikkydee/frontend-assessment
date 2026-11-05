import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

export class TransactionPinPage extends PageBase {

    // Locators
    readonly pageHeading: Locator;
    readonly pinInputs: Locator;
    readonly confirmBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.pageHeading = page.getByRole('heading', { name: 'Enter your 78 PIN' });
        this.pinInputs = page.getByLabel(/Please enter OTP character \d+/);
        this.confirmBtn = page.getByRole('button', { name: 'Confirm' });
    }

    async enterPin(pin: string): Promise<void> {
        await this.pinInputs.first().waitFor({ state: 'visible' });
        const digits = pin.split('');
        for (let i = 0; i < digits.length; i++) {
            await this.pinInputs.nth(i).fill(digits[i]);
        }
    }

    async clickConfirmBtn(): Promise<void> {
        await this.confirmBtn.click();
    }
}
