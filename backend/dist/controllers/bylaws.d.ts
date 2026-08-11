import { Request, Response } from 'express';
/**
 * Get the current Chama group's bylaws configuration
 */
export declare const getChamaBylaws: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update the current Chama group's bylaws configuration (Authorized Group Officials only)
 */
export declare const updateChamaBylaws: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bylaws.d.ts.map