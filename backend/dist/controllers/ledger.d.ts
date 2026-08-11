import { Request, Response } from 'express';
export declare const getLedgers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const postTransaction: (req: Request, res: Response) => Promise<void>;
export declare const postBatchTransaction: (req: Request, res: Response) => Promise<void>;
export declare const exportChamasLedgerCsv: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ledger.d.ts.map