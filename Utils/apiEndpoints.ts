/**
 * Backend endpoints the UI calls during the flow.
 * Used to wait on, and assert against, the network responses behind each UI step.
 */
export const API = {
    TOKEN: '/identity/connect/token',
    USER_PROFILE: '/onboard/api/v2/user',
    CAN_TRANSFER: '/transfer/api/v1/transfer-controls/can-transfer',
    NAME_ENQUIRY: '/transfer/api/v1/NameEnquiry/',
    TRANSFER_CHARGES: '/transfer/api/v1/TransferCharges/by-amount-and-type/',
    TRANSFER: /\/transfer\/api\/v1\/transfer$/,
} as const;
