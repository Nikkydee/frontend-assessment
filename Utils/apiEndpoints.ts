/**
 * Backend endpoints the UI calls during the flow.
 * Used to wait on, and assert against, the network responses behind each UI step.
 */
export const API = {
    TOKEN: '/identity/connect/token',
    NAME_ENQUIRY: '/transfer/api/v1/NameEnquiry/',
    TRANSFER_CHARGES: '/transfer/api/v1/TransferCharges/by-amount-and-type/',
    TRANSFER: /\/transfer\/api\/v1\/transfer$/,
} as const;
