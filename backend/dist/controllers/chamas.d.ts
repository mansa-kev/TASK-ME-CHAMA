import { Request, Response } from 'express';
export declare const getChamas: (req: Request, res: Response) => Promise<void>;
export declare const createChama: (req: Request, res: Response) => Promise<void>;
export declare const updateChama: (req: Request, res: Response) => Promise<void>;
export declare const rotateMerryGoRound: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyChama: (req: Request, res: Response) => Promise<any>;
export declare const getChamaById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getChamaMembers: (req: Request, res: Response) => Promise<void>;
export declare const getChamaTableBanking: (req: Request, res: Response) => Promise<void>;
export declare const chamaDeposit: (req: Request, res: Response) => Promise<void>;
export declare const chamaPenalty: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=chamas.d.ts.map