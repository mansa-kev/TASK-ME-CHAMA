import { Request, Response } from 'express';
/**
 * Get all available SaaS subscription plans
 */
export declare const getSubscriptionPlans: (req: Request, res: Response) => Promise<void>;
/**
 * Super Admin: Create or update a subscription plan
 */
export declare const upsertSubscriptionPlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Super Admin: List all tenant Chamas with active subscription, member metrics, and health indicators
 */
export declare const getTenants: (req: Request, res: Response) => Promise<void>;
/**
 * Super Admin: Update tenant status (ACTIVE, TRIAL, SUSPENDED)
 */
export declare const updateTenantStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Super Admin: Soft Delete / Deactivate a Tenant
 */
export declare const deleteTenant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Super Admin: Global Platform Analytics
 */
export declare const getPlatformAnalytics: (req: Request, res: Response) => Promise<void>;
/**
 * Super Admin: Immutable Audit Logs Viewer
 */
export declare const getAuditLogs: (req: Request, res: Response) => Promise<void>;
/**
 * Public Self-Service Registration for a new Chama Group
 */
export declare const registerChamaTenant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get current tenant's subscription & usage status
 */
export declare const getCurrentSubscription: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Super Admin: Get SMS Gateway Dispatch Logs
 */
export declare const getSmsLogs: (req: Request, res: Response) => Promise<void>;
/**
 * Super Admin: Dispatch SMS / In-App Platform Broadcast
 */
export declare const sendSmsBroadcast: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Super Admin: Get M-Pesa Daraja Gateway Status & KPIs
 */
export declare const getDarajaStatus: (req: Request, res: Response) => Promise<void>;
/**
 * Super Admin: Get Daraja Transaction Logs
 */
export declare const getDarajaLogs: (req: Request, res: Response) => Promise<void>;
/**
 * Super Admin: Trigger Sandbox / Live Test STK Push
 */
export declare const testStkPush: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=saas.d.ts.map