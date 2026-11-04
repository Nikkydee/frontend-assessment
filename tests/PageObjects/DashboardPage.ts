import { Page, Locator } from '@playwright/test';
import { PageBase } from './PageBase';

export class DashboardPage extends PageBase {

    // Locators
    readonly dashboardContainer: Locator;
    readonly welcomeHeading: Locator;
    readonly totalBalanceLabel: Locator;
    readonly sendBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.dashboardContainer = page.getByTestId('dashboard-page');
        this.welcomeHeading = page.getByRole('heading', { name: /welcome back/i });
        this.totalBalanceLabel = this.dashboardContainer.getByText('TOTAL BALANCE');
        this.sendBtn = this.dashboardContainer.getByText('Send', { exact: true });
    }

    async clickSendBtn(): Promise<void> {
        await this.sendBtn.click();
    }
}
