import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../PageObjects/LoginPage';
import { OTPPage } from '../../PageObjects/OTPPage';
import { DashboardPage } from '../../PageObjects/DashboardPage';
import { TransferPage } from '../../PageObjects/TransferPage';
import { ReviewTransferPage } from '../../PageObjects/ReviewTransferPage';
import { TransactionPinPage } from '../../PageObjects/TransactionPinPage';
import { TransferSuccessPage } from '../../PageObjects/TransferSuccessPage';
import { formatAmount, parseAmount, getEnv } from '../../../Utils/helperMethods';

/**
 * End-to-end flow: Login -> OTP -> Funds Transfer.
 * Tests run serially on one shared page because every login generates an OTP
 * and the app rate-limits OTP requests, so the flow logs in only once.
 */
test.describe.serial('Login to Funds Transfer', { tag: '@sanity' }, () => {
    let page: Page;
    let loginPage: LoginPage;
    let otpPage: OTPPage;
    let dashboardPage: DashboardPage;
    let transferPage: TransferPage;
    let reviewPage: ReviewTransferPage;
    let pinPage: TransactionPinPage;
    let successPage: TransferSuccessPage;

    // Read from the account list on the transfer page, so it works for any user
    let sourceAccountNumber: string;

    const email = getEnv('USER_EMAIL');
    const password = getEnv('USER_PASSWORD');
    const otp = getEnv('OTP_CODE');
    const pin = getEnv('TRANSACTION_PIN');
    const bankName = getEnv('BENEFICIARY_BANK');
    const beneficiaryAccount = getEnv('BENEFICIARY_ACCOUNT');
    const amount = Number(getEnv('TRANSFER_AMOUNT'));
    const narration = `Automation test ${Date.now()}`;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        loginPage = new LoginPage(page);
        otpPage = new OTPPage(page);
        dashboardPage = new DashboardPage(page);
        transferPage = new TransferPage(page);
        reviewPage = new ReviewTransferPage(page);
        pinPage = new TransactionPinPage(page);
        successPage = new TransferSuccessPage(page);
        await loginPage.open();
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('Validate that user is prompted for OTP after entering valid credentials', async () => {
        await expect(loginPage.emailField).toBeVisible();
        await expect(loginPage.passwordField).toBeVisible();

        await loginPage.fillCredentials(email, password);
        await loginPage.clickSubmitBtn();

        // Valid credentials take the user to the OTP verification screen
        await expect(page).toHaveURL(/\/otp$/);
        await expect(otpPage.pageHeading).toBeVisible();
        await expect(otpPage.otpInputs).toHaveCount(otp.length);
    });

    test('Validate that user can log in successfully with a valid OTP', async () => {
        await otpPage.enterOtp(otp);
        await otpPage.clickContinueBtn();

        // A valid OTP completes login and lands the user on the dashboard
        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(dashboardPage.dashboardContainer).toBeVisible();
        await expect(dashboardPage.welcomeHeading).toBeVisible();
        await expect(dashboardPage.totalBalanceLabel).toBeVisible();
    });

    test('Validate that user can navigate to the Funds Transfer page', async () => {
        await dashboardPage.clickSendBtn();

        await expect(transferPage.pageHeading).toBeVisible();
        await expect(transferPage.nextBtn).toBeDisabled();

        sourceAccountNumber = await transferPage.getFirstSourceAccountNumber();
        await transferPage.selectSourceAccount(sourceAccountNumber);
        await expect(transferPage.nextBtn).toBeEnabled();
        await transferPage.clickNextBtn();

        await expect(transferPage.transferFromSection).toContainText(sourceAccountNumber);
        await expect(transferPage.amountField).toBeVisible();
        await expect(transferPage.transferToDropdown).toBeVisible();
        await expect(transferPage.reviewTransferBtn).toBeDisabled();
    });

    test('Validate that user can transfer funds to a new recipient', async () => {
        let recipientName = '';
        let total = 0;

        await test.step('Enter amount and recipient details', async () => {
            await transferPage.enterAmount(String(amount));
            await transferPage.chooseNewRecipient();
            await transferPage.selectBank(bankName);
            await transferPage.enterAccountNumber(beneficiaryAccount);

            // The app resolves and displays the recipient's account name
            recipientName = await transferPage.getResolvedAccountName();
            expect(recipientName).not.toBe('');

            await expect(transferPage.reviewTransferBtn).toBeEnabled();
        });

        await test.step('Review the transfer details', async () => {
            await transferPage.clickReviewTransferBtn();

            await expect(reviewPage.pageHeading).toBeVisible();
            await expect(reviewPage.amountValue).toHaveText(`NGN ${formatAmount(amount)}`);
            await expect(reviewPage.recipientNameValue).toHaveText(recipientName);
            await expect(reviewPage.recipientBankValue).toHaveText(bankName);
            await expect(reviewPage.recipientAccountValue).toHaveText(beneficiaryAccount);

            // The total the user is debited must equal the amount plus the displayed fee
            const fee = parseAmount(await reviewPage.feesValue.innerText());
            total = parseAmount(await reviewPage.totalAmountValue.innerText());
            expect(total).toBeCloseTo(amount + fee, 2);

            await reviewPage.enterNarration(narration);
            await reviewPage.clickSendMoneyBtn();
        });

        await test.step('Authorise with transaction PIN and confirm success', async () => {
            await expect(pinPage.pageHeading).toBeVisible();
            await expect(pinPage.pinInputs).toHaveCount(pin.length);
            await pinPage.enterPin(pin);

            await pinPage.clickConfirmBtn();

            // The transfer is processed and the success dialog is shown
            await expect(successPage.pageHeading).toBeVisible();
            await expect(successPage.summaryText).toContainText(`₦ ${formatAmount(total)}`);
            await expect(successPage.summaryText).toContainText(recipientName);
        });
    });
});
