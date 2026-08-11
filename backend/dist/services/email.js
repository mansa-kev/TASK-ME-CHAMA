"use strict";
/**
 * Email Service
 *
 * TODO: Configure SMTP host, port, user, and password in .env
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatementEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const sendEmail = async (to, subject, htmlContent, attachments) => {
    // TODO: Implement Nodemailer or SendGrid logic
    console.log(`[EMAIL] Sending email to ${to}: "${subject}"`);
    if (attachments) {
        console.log(`[EMAIL] Attachments included: ${attachments.length}`);
    }
    return { status: 'success' };
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = async (to, name) => {
    const subject = 'Welcome to Taskme Chama!';
    const content = `<h1>Welcome, ${name}!</h1><p>We are glad to have you on board.</p>`;
    return (0, exports.sendEmail)(to, subject, content);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendStatementEmail = async (to, name, pdfBuffer) => {
    const subject = 'Your Monthly Statement';
    const content = `<p>Dear ${name}, please find attached your monthly statement.</p>`;
    return (0, exports.sendEmail)(to, subject, content, [{ filename: 'Statement.pdf', content: pdfBuffer }]);
};
exports.sendStatementEmail = sendStatementEmail;
//# sourceMappingURL=email.js.map