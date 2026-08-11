/**
 * Email Service
 * 
 * TODO: Configure SMTP host, port, user, and password in .env
 */

export const sendEmail = async (to: string, subject: string, htmlContent: string, attachments?: any[]) => {
  // TODO: Implement Nodemailer or SendGrid logic
  console.log(`[EMAIL] Sending email to ${to}: "${subject}"`);
  if (attachments) {
    console.log(`[EMAIL] Attachments included: ${attachments.length}`);
  }
  return { status: 'success' };
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const subject = 'Welcome to Taskme Chama!';
  const content = `<h1>Welcome, ${name}!</h1><p>We are glad to have you on board.</p>`;
  return sendEmail(to, subject, content);
};

export const sendStatementEmail = async (to: string, name: string, pdfBuffer: Buffer) => {
  const subject = 'Your Monthly Statement';
  const content = `<p>Dear ${name}, please find attached your monthly statement.</p>`;
  return sendEmail(to, subject, content, [{ filename: 'Statement.pdf', content: pdfBuffer }]);
};
