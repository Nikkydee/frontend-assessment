import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

export class ReviewTransferPage extends PageBase {

    // Locators
    readonly pageHeading: Locator;
    readonly amountValue: Locator;
    readonly feesValue: Locator;
    readonly totalAmountValue: Locator;
    readonly recipientNameValue: Locator;
    readonly recipientBankValue: Locator;
    readonly recipientAccountValue: Locator;
    readonly narrationField: Locator;
    readonly sendMoneyBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.pageHeading = page.getByRole('heading', { name: 'Review Transactions' });
        this.amountValue = this.detailValue("You're sending");
        this.feesValue = this.detailValue('Applicable fees');
        this.totalAmountValue = this.detailValue('Total amount');
        this.recipientNameValue = this.detailValue('Account name');
        this.recipientBankValue = this.detailValue('Bank Name');
        this.recipientAccountValue = this.detailValue('Account number');
        this.narrationField = page.getByText('NARRATION', { exact: true }).locator('..').locator('input');
        this.sendMoneyBtn = page.getByRole('button', { name: 'Send Money' });
    }

    /** Value displayed next to a label in the transfer/recipient details. */
    private detailValue(label: string): Locator {
        return this.page.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]');
    }

    async enterNarration(narration: string): Promise<void> {
        await this.fillField(this.narrationField, narration);
    }

    async clickSendMoneyBtn(): Promise<void> {
        await this.sendMoneyBtn.click();
    }
}
