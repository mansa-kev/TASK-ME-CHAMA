import { Request, Response } from 'express';
export declare const getStaffPerformance: (req: Request, res: Response) => Promise<void>;
export declare const getMemberStatement: (req: Request, res: Response) => Promise<void>;
export declare const generateReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const saveReport: (req: Request, res: Response) => Promise<void>;
export declare const getSavedReports: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=reports.d.ts.map