export interface RoleDefinition {
  id: string;
  name: string;
  scope: string;
  capabilities: string;
}

export const RBAC_ROLES: RoleDefinition[] = [
  {
    id: 'ROLE_TCM_SUPER_ADMIN',
    name: 'TCM Super Admin',
    scope: 'Platform / System-Wide',
    capabilities: 'Multi-tenant onboarding, global subscription management, SaaS billing, master audit logs, global constants.'
  },
  {
    id: 'ROLE_CHAMA_ADMIN',
    name: 'Chama Admin',
    scope: 'Organization Level',
    capabilities: 'Full operational management, staff onboarding, loan product rate creation, accounting chart configuration.'
  },
  {
    id: 'ROLE_BRANCH_MANAGER',
    name: 'Branch Manager',
    scope: 'Branch Level',
    capabilities: 'Local branch performance monitoring, loan approvals above clerk limits, branch reconciliations.'
  },
  {
    id: 'ROLE_CREDIT_OFFICER',
    name: 'Credit / Loan Officer',
    scope: 'Credit Risk & Appraisal',
    capabilities: 'Loan application appraisal, credit scoring, guarantor verification, default collection tracking.'
  },
  {
    id: 'ROLE_TELLER',
    name: 'Teller / Clerk / Cashier',
    scope: 'Front Office & Desk',
    capabilities: 'Cash/M-Pesa deposit processing, manual transaction entry, passbook updates, withdrawal payouts.'
  },
  {
    id: 'ROLE_FIELD_OFFICER',
    name: 'Field Officer / Agent',
    scope: 'Field Operations',
    capabilities: 'Mobile Chama group onboarding, field repayment collection, commission tracking, task lists.'
  },
  {
    id: 'ROLE_MEMBER',
    name: 'Member / Chama Member',
    scope: 'Self-Service Portal',
    capabilities: 'View personal savings & share balances, check loan eligibility, request "Save Now Pick Later" asset financing, download PDF/Excel statements.'
  }
];
