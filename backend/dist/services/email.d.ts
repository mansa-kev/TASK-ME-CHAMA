/**
 * Email Service
 *
 * TODO: Configure SMTP host, port, user, and password in .env
 */
export declare const sendEmail: (to: string, subject: string, htmlContent: string, attachments?: any[]) => Promise<{
    status: string;
}>;
export declare const sendWelcomeEmail: (to: string, name: string) => Promise<{
    status: string;
}>;
export declare const sendStatementEmail: (to: string, name: string, pdfBuffer: Buffer) => Promise<{
    status: string;
}>;
//# sourceMappingURL=email.d.ts.map