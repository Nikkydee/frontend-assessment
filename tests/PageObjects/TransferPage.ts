import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

/** "Send money easily" modal: source account, amount and recipient details. */
export class TransferPage extends PageBase {

    // Locators
    readonly pageHeading: Locator;
    readonly selectBalanceSection: Locator;
    readonly nextBtn: Locator;
    readonly firstSourceAccount: Locator;
    readonly transferFromSection: Locator;
    readonly amountField: Locator;
    readonly transferToDropdown: Locator;
    readonly newRecipientOption: Locator;
    readonly bankDropdown: Locator;
    readonly bankSearchField: Locator;
    readonly accountNumberField: Locator;
    readonly accountNameLabel: Locator;
    readonly reviewTransferBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.pageHeading = page.getByRole('heading', { name: 'Send money easily' });
        this.selectBalanceSection = page.getByText('Select Balance').locator('..');
        this.nextBtn = page.getByRole('button', { name: 'Next' });
        this.firstSourceAccount = this.selectBalanceSection.getByText(/^\d{10}$/).first();
        this.transferFromSection = page.getByText('Transfer From', { exact: true }).locator('..');
        this.amountField = page.getByPlaceholder('0.00');
        this.transferToDropdown = page.getByText('Send to a...');
        this.newRecipientOption = page.getByText('Send to a new recipient');
        this.bankDropdown = page.locator('button[role="combobox"]');
        this.bankSearchField = page.getByPlaceholder('Search...');
        this.accountNumberField = page.locator('input[name="accountNumber"]');
        this.accountNameLabel = page.getByText('Account name', { exact: true });
        this.reviewTransferBtn = page.getByRole('button', { name: 'Review Transfer' });
    }

    sourceAccount(accountNumber: string): Locator {
        return this.selectBalanceSection.getByText(accountNumber, { exact: true });
    }

    bankOption(bankName: string): Locator {
        return this.page.getByRole('option', { name: bankName, exact: true });
    }

    resolvedAccountName(accountName: string): Locator {
        return this.accountNameLabel.locator('..').getByText(accountName, { exact: true });
    }

    async getFirstSourceAccountNumber(): Promise<string> {
        await this.firstSourceAccount.waitFor({ state: 'visible' });
        return (await this.firstSourceAccount.innerText()).trim();
    }

    async selectSourceAccount(accountNumber: string): Promise<void> {
        await this.sourceAccount(accountNumber).click();
    }

    async clickNextBtn(): Promise<void> {
        await this.nextBtn.click();
    }

    async enterAmount(amount: string): Promise<void> {
        await this.fillField(this.amountField, amount);
    }

    async chooseNewRecipient(): Promise<void> {
        await this.transferToDropdown.click();
        await this.newRecipientOption.click();
    }

    async selectBank(bankName: string): Promise<void> {
        await this.bankDropdown.click();
        await this.fillField(this.bankSearchField, bankName);
        await this.bankOption(bankName).click();
    }

    async enterAccountNumber(accountNumber: string): Promise<void> {
        await this.fillField(this.accountNumberField, accountNumber);
    }

    async clickReviewTransferBtn(): Promise<void> {
        await this.reviewTransferBtn.click();
    }
}
