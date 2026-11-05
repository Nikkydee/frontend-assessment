import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

export class TransferSuccessPage extends PageBase {

    // Locators
    readonly pageHeading: Locator;
    readonly summaryText: Locator;
    readonly downloadReceiptBtn: Locator;
    readonly viewDetailsBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.pageHeading = page.getByRole('heading', { name: 'Transaction Successful' });
        this.summaryText = page.getByText(/you have completed a transfer of/);
        this.downloadReceiptBtn = page.getByRole('button', { name: 'Download Receipt' });
        this.viewDetailsBtn = page.getByRole('button', { name: 'View Details' });
    }
}
