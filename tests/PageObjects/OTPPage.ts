import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

export class OTPPage extends PageBase {

    // Locators
    readonly pageHeading: Locator;
    readonly otpInputs: Locator;
    readonly continueBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.pageHeading = page.getByRole('heading', { name: 'OTP Verification' });
        // The OTP is split across one input per digit ("Please enter OTP character 1..6")
        this.otpInputs = page.getByLabel(/Please enter OTP character \d+/);
        this.continueBtn = page.getByRole('button', { name: 'Continue' });
    }

    async enterOtp(code: string): Promise<void> {
        await this.otpInputs.first().waitFor({ state: 'visible' });
        const digits = code.split('');
        for (let i = 0; i < digits.length; i++) {
            await this.otpInputs.nth(i).fill(digits[i]);
        }
    }

    async clickContinueBtn(): Promise<void> {
        await this.continueBtn.click();
    }
}
