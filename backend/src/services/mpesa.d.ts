/**
 * M-Pesa (Safaricom Daraja API) Service
 *
 * TODO: Configure consumer key and secret from Safaricom Developer Portal
 * and add to .env file.
 */
export declare const generateMpesaToken: () => Promise<string>;
export declare const initiateStkPush: (phoneNumber: string, amount: number, accountReference: string) => Promise<{
    status: string;
    checkoutRequestId: string;
}>;
export declare const registerC2BUrls: () => Promise<{
    status: string;
}>;
export declare const initiateB2C: (phoneNumber: string, amount: number, commandId?: string) => Promise<{
    status: string;
}>;
//# sourceMappingURL=mpesa.d.ts.map