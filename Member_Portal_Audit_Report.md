# Member Portal End-to-End Audit Report

## Executive Summary
This report details the findings from an intensive end-to-end audit of the Taskme Chama Member Portal. The objective was to identify mock data, hardcoded metrics, dead ends, and unimplemented logic within the frontend components and trace them back to their respective backend API endpoints. No codebase changes have been made.

---

## 1. Onboarding & Offboarding Logic (Dead Ends & Bugs)

### `ChamaOnboarding.tsx` (Group Onboarding)
*   **Dead End (Leadership Roster):** In Step 2 (Leadership Roster), the inputs for "Chairperson", "Secretary", and "Treasurer" are purely cosmetic. They lack `value` and `onChange` bindings in React state. Any data typed into these fields is discarded and not sent to the backend.
*   **Hardcoded Payload Bug:** The final submission payload hardcodes `roscaEnabled: false` inside the `handleSubmit` function, completely ignoring the `formData.roscaEnabled` state tied to the UI checkbox.
*   **Visual Logic Bug:** Step navigation visually allows users to jump steps without completing mandatory fields, potentially sending incomplete data.

### `IndividualOnboarding.tsx` (Member Onboarding)
*   **Duplicate Navigation:** Step 4 has two ways to proceed to Step 5—a localized `Review ->` button and the sticky footer `Next Step` button. Using the footer button bypasses the mandatory KYC document upload check (`!formData.passportPhoto`, etc.) implemented in the local button.
*   **Hardcoded Roles:** The onboarding form completely ignores dynamically fetching roles and automatically registers users as `"MEMBER"` with hardcoded logic mapping them to default products (Share Capital & BOSA Savings).

### Offboarding & Withdrawals
*   **Missing Member Functionality:** There is absolutely no member-facing UI to initiate offboarding, exit the Chama, or request a withdrawal of savings. 
*   **Backend Support Exists:** The backend API and `OperationsModule.tsx` contain logic for `fetchWithdrawalRequests`, `approveWithdrawal`, and `rejectWithdrawal`, but the member portal (e.g., `MySavings.tsx`, `WalletModule.tsx`) provides no way to trigger these requests.

---

## 2. Component-by-Component Analysis

### `WalletModule.tsx` (Payments)
*   **Mock Payment Processing:** The STK push integration is a frontend simulation using `setTimeout` to mimic M-Pesa processing.
*   **Mock Backend Route (`POST /payments/deposit`):** The backend does not integrate with Daraja/M-Pesa. It blindly trusts the frontend payload, generates a fake M-Pesa reference (`MPESA-${Date.now()}-${Math.floor(Math.random() * 1000)}`), and directly credits the ledger.
*   **Hardcoded Metrics:** The default minimum contribution amount is hardcoded as `profile?.chama?.standardContribution || 2500` instead of securely validating against backend Chama bylaws.
*   **Hardcoded Payment Types:** Logic for resolving payment types strictly relies on strings (`type === 'savings' ? 'SAVINGS' : ...`), leaving no room for custom Chama contribution categories.

### `MyLoans.tsx` (Loan Lifecycle)
*   **Hardcoded Interest Rates:** The visual display for the interest rate is hardcoded to `12% p.a`. This value (`0.12`) is also hardcoded into the backend when generating repayment schedules. 
*   **Hardcoded Processing Fee:** Visually hardcoded to `2%` (e.g., `amount * 0.02`), but this fee isn't actually deducted from the disbursed loan or logged as a system fee in the backend.
*   **Amortization Schedule Bug (n=3):** The CSV export logic for the loan amortization schedule contains a critical bug where the loan term is hardcoded to `const n = 3;` months. If a user has a 12-month loan, the downloaded CSV will incorrectly only show 3 months.
*   **Hardcoded Mock Data (Facility Details):** When viewing an active loan, the "Next Installment" date is visually hardcoded to `"Aug 5, 2026"` and the "Installment Amount" to `"KES 4,200"`. It does not calculate this from the `activeLoanBalance` or `repayments` array.
*   **Guarantor Thresholds:** The backend logic pushes a loan to `PENDING_APPROVAL` precisely when it reaches 3 guarantors (`if (allGuarantors.length >= 3)` in `loans.ts`), rather than dynamically adhering to Chama-specific bylaws.

### `MySavings.tsx`
*   **Chart Rendering Bug / Mocking:** The local chart data aggregation maps over the user's transaction history. However, if the user has no transaction history (`transactions.length === 0`), it defaults to rendering a single mock entry `[{ name: 'Current', amount: ledger.savingsBalance || 0 }]` to prevent the charting library from crashing.

### `StatementsModule.tsx`
*   **CSV Export Vulnerability/Bug:** The CSV export manually concatenates strings (`t.date,t.description,t.amount`). If `t.description` contains a comma (e.g., "Payment for Share Capital, January"), it will break the CSV column formatting.

### `GuarantorshipModule.tsx`
*   **Demo States:** The module heavily relies on visual demo empty states if there are no pending requests, using static illustrations rather than dynamic component logic.
*   **Backend Trace:** Accepting a request hits `PUT /loans/guarantors/:id/accept`, which correctly updates the status but relies on the hardcoded "3 guarantor" logic mentioned above to advance the loan.

### `MembersDashboard.tsx` & `MemberProfile.tsx`
*   **Fines & Penalties:** `finesBalance` appears to be dynamically calculated by the backend (`/members/me` endpoint checks `disciplinaryRecord`), but the frontend dashboard UI elements lack a dedicated interface to contest or pay these fines specifically, forcing users to use the generic 'Wallet' top-up.

---

## 3. General Architecture Observations
*   **Double-Entry Accounting:** To its credit, the backend (e.g., in `loans.ts`) actually uses robust transactional queries (`prisma.transaction`) and `journal_vouchers` to track double-entry accounting on disbursements, rather than simple mock updates.
*   **Missing Error Boundaries:** Many components rely on `try/catch` with `toast.error`, but missing data (like a null `chama` object inside `profile`) can cause unhandled exceptions that break the render cycle.
