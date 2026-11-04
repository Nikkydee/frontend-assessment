/**
 * Backend endpoints the UI calls during the flow.
 * Used to wait on, and assert against, the network responses behind each UI step.
 */
export const API = {
    TOKEN: '/identity/connect/token',
    USER_PROFILE: '/onboard/api/v2/user',
} as const;
