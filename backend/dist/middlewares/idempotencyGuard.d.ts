import { Request, Response, NextFunction } from 'express';
/**
 * Ensures financial mutations (loan payouts, disbursements, fee settlements) are executed exactly once
 * even if duplicate requests are triggered by network retries or multiple clicks.
 */
export declare const idempotencyGuard: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=idempotencyGuard.d.ts.map