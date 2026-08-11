/**
 * Africa's Talking SMS Service
 *
 * TODO: Configure API key and username in .env
 */
export declare const sendSms: (phoneNumber: string, message: string) => Promise<{
    status: string;
    messageId: string;
}>;
export declare const sendBulkSms: (phoneNumbers: string[], message: string) => Promise<{
    status: string;
}>;
//# sourceMappingURL=sms.d.ts.map