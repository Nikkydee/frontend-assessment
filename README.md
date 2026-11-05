# 78MFB Funds Transfer Automation

Playwright UI automation for the **Login → OTP → Funds Transfer** flow of the
78MFB web app (`app-dev.bank78.co`).

## Tech stack

- [Playwright Test](https://playwright.dev/) (TypeScript)
- Node.js
- `dotenv` for local configuration
- `allure-playwright` for reporting

## What is covered

A single end-to-end journey, written as serial steps against one shared browser
session:

1. **Launch** the application login page.
2. **Log in** with valid credentials and reach the OTP screen.
3. **Verify OTP** and land on the dashboard.
4. **Navigate** to the Funds Transfer ("Send money") screen.
5. **Transfer** funds to a new recipient (bank + account number), review the
   details, authorise with the transaction PIN, and confirm the success screen.

### Assertions

The tests validate the flow **through the UI only** — page navigation, element
state and on-screen values:

- **Successful login:** credentials lead to the OTP screen, and a valid OTP
  lands on the dashboard (welcome heading and balance visible).
- **Navigation to the transfer page:** the Send modal opens, "Next" is disabled
  until a source account is selected, and the amount/recipient form appears.
- **Successful transaction:** the resolved recipient name is shown, the review
  screen's amount / recipient / bank / account number are correct and the total
  equals amount + fee, and the "Transaction Successful" dialog confirms the
  amount and recipient.

> **Note on API assertions:** status codes, response structure and response
> values are covered in a **separate Postman collection** for the API portion of
> the assessment, so the UI tests deliberately avoid asserting on network calls.

## Project structure

```
.
├── Utils/
│   └── helperMethods.ts          # getEnv, formatAmount, parseAmount
├── tests/
│   ├── PageObjects/
│   │   ├── PageBase.ts            # Shared base (navigation, field helpers)
│   │   ├── LoginPage.ts
│   │   ├── OTPPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── TransferPage.ts        # "Send money" modal
│   │   ├── ReviewTransferPage.ts  # "Review Transactions" screen
│   │   ├── TransactionPinPage.ts  # "Enter your 78 PIN" dialog
│   │   └── TransferSuccessPage.ts # "Transaction Successful" dialog
│   └── Tests/
│       └── UI/
│           └── fundsTransfer.spec.ts
├── .env                          # Local secrets (git-ignored)
├── .env.example                  # Template for .env
├── playwright.config.ts
└── tsconfig.json
```

The design follows the Page Object Model: locators and actions live in the page
objects, and the spec reads as the business flow. Waits are explicit — the
tests rely on Playwright's web-first assertions and `waitFor` conditions rather
than fixed sleeps.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   npx playwright install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the values provided for the
   assessment:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `BASE_URL` | Application URL, e.g. `https://app-dev.bank78.co` |
   | `USER_EMAIL` | Login email |
   | `USER_PASSWORD` | Login password |
   | `OTP_CODE` | Test OTP code |
   | `TRANSACTION_PIN` | Transaction PIN used to authorise the transfer |
   | `BENEFICIARY_BANK` | Recipient bank name (as listed in the app) |
   | `BENEFICIARY_ACCOUNT` | Recipient account number |
   | `TRANSFER_AMOUNT` | Amount to transfer, e.g. `100` |

   `.env` is git-ignored and must never be committed.

3. **Run the tests**

   ```bash
   npm test                 # run the whole suite
   npm run test:headed      # run with a visible browser
   npm run test:sanity      # run only @sanity-tagged tests
   ```

   View the Playwright HTML report:

   ```bash
   npx playwright show-report
   ```

   Generate the Allure report (requires the Allure CLI):

   ```bash
   npm run test:test-report   # run tests, then build the Allure report
   ```

## Important: OTP rate limiting

Each login generates a one-time OTP, and the backend **rate-limits OTP
requests** on an account. After a few logins in a short window the account is
temporarily locked (the lock escalates from minutes to several hours), and the
OTP screen shows *"You've requested too many codes."*

Because of this, the suite is intentionally designed to **log in only once**:
the tests share a single browser session (`test.describe.serial` with one page
created in `beforeAll`). Avoid running the full suite repeatedly in quick
succession on the same account; use a funded test account whose OTP allowance is
available.

## CI

The suite is CI-ready. Provide the `.env` values as CI secrets (environment
variables) so no credentials are stored in the repository.
