/** Reads a required environment variable and fails fast if it is missing. */
export const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
    }
    return value;
};

/** Formats a number the way the app displays money, e.g. 1000 -> "1,000.00". */
export const formatAmount = (amount: number): string =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Parses a displayed money string like "NGN 1,010.75" or "₦ 1,010.75" into a number. */
export const parseAmount = (text: string): number =>
    Number(text.replace(/[^0-9.]/g, ''));
