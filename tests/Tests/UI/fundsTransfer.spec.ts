import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../PageObjects/LoginPage';
import { OTPPage } from '../../PageObjects/OTPPage';
import { DashboardPage } from '../../PageObjects/DashboardPage';
import { waitForApiResponse, getEnv } from '../../../Utils/helperMethods';
import { API } from '../../../Utils/apiEndpoints';

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

    const email = getEnv('USER_EMAIL');
    const password = getEnv('USER_PASSWORD');
    const otp = getEnv('OTP_CODE');

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        loginPage = new LoginPage(page);
        otpPage = new OTPPage(page);
        dashboardPage = new DashboardPage(page);
        await loginPage.open();
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('Validate that user is prompted for OTP after entering valid credentials', async () => {
        await expect(loginPage.emailField).toBeVisible();
        await expect(loginPage.passwordField).toBeVisible();

        await loginPage.fillCredentials(email, password);
        const response = await waitForApiResponse(page, API.TOKEN, () => loginPage.clickSubmitBtn());

        // Valid credentials without an OTP are answered with an "OTP required" challenge
        const body = await response.json();
        expect(response.status()).toBe(400);
        expect(body.otpRequired).toBe(true);
        expect(body.status).toBe('OtpGenerated');

        await expect(page).toHaveURL(/\/otp$/);
        await expect(otpPage.pageHeading).toBeVisible();
        await expect(otpPage.otpInputs).toHaveCount(otp.length);
    });

    test('Validate that user can log in successfully with a valid OTP', async () => {
        await otpPage.enterOtp(otp);
        const [tokenResponse, profileResponse] = await Promise.all([
            page.waitForResponse(res => res.url().includes(API.TOKEN) && res.request().method() === 'POST'),
            page.waitForResponse(res => res.url().includes(API.USER_PROFILE) && res.status() === 200),
            otpPage.clickContinueBtn(),
        ]);

        const tokenBody = await tokenResponse.json();
        expect(tokenResponse.status()).toBe(200);
        expect(tokenBody.token_type).toBe('Bearer');
        expect(typeof tokenBody.access_token).toBe('string');

        const { user } = (await profileResponse.json()).result;
        expect(user.username).toBe(email);

        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(dashboardPage.dashboardContainer).toBeVisible();
        await expect(dashboardPage.welcomeHeading).toHaveText(new RegExp(`welcome back, ${user.firstName}`, 'i'));
        await expect(dashboardPage.totalBalanceLabel).toBeVisible();
    });
});
