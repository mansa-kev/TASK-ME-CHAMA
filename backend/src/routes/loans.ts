import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middlewares/authMiddleware";

const getQueryWhere = (req: any) => {
  if (req.user?.role === "TCM_SUPER_ADMIN") return {};
  return { chamaId: req.user?.chamaId };
};

const getPostChamaId = (req: any) => {
  if (req.user?.role === "TCM_SUPER_ADMIN" && req.body.chamaId) {
    return req.body.chamaId;
  }
  return req.user?.chamaId;
};
const router = Router();
router.use(authMiddleware);

// ─── INVESTMENTS ─────────────────────────────────────────────

router.get("/investments", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).investment.findMany({
      where: getQueryWhere(req as any),
      orderBy: { createdAt: "desc" },
    });
    // BosaLedgers expects rate, but Prisma model has interestRate. Let's map it.
    const mapped = data.map((item: any) => ({
      ...item,
      rate: item.interestRate,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch investments" });
  }
});

router.post("/investments", async (req: Request, res: Response) => {
  try {
    const { name, type, principal, rate, maturityDate } = req.body;
    const investment = await (prisma as any).investment.create({
      data: {
        chamaId: getPostChamaId(req as any),
        name,
        type,
        principal: parseFloat(principal),
        interestRate: parseFloat(rate),
        maturityDate: new Date(maturityDate),
        status: "ACTIVE",
      },
    });
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create investment" });
  }
});

// ─── FIXED DEPOSITS ────────────────────────────────────────

router.get("/fixed-deposits", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).fixedDeposit.findMany({
      where: getQueryWhere(req as any),
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fixed deposits" });
  }
});

router.post("/fixed-deposits", async (req: Request, res: Response) => {
  try {
    const { memberId, memberName, amount, rate, duration, startDate } =
      req.body;

    let maturityDate = new Date();
    if (startDate) {
      maturityDate = new Date(startDate);
    }
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(duration));

    const fixedDeposit = await (prisma as any).fixedDeposit.create({
      data: {
        chamaId: getPostChamaId(req as any),
        memberId,
        memberName,
        amount: parseFloat(amount),
        rate: parseFloat(rate),
        duration: parseInt(duration),
        startDate: startDate ? new Date(startDate) : new Date(),
        maturityDate,
        status: "ACTIVE",
      },
    });
    res.status(201).json(fixedDeposit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create fixed deposit" });
  }
});

// ─── SAVINGS ACCOUNTS ──────────────────────────────────────

router.get("/savings-accounts", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).savingsAccount.findMany({
      where: getQueryWhere(req as any),
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch savings accounts" });
  }
});

router.post("/savings-accounts", async (req: Request, res: Response) => {
  try {
    const acctNum = `SAV-${Date.now().toString(36).toUpperCase()}`;
    const data = await (prisma as any).savingsAccount.create({
      data: {
        chamaId: getPostChamaId(req as any),
        ...req.body,
        accountNumber: req.body.accountNumber || acctNum,
      },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create savings account" });
  }
});

router.delete("/savings-accounts/:id", async (req: Request, res: Response) => {
  try {
    await (prisma as any).savingsAccount.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete savings account" });
  }
});

// ─── SHARE HOLDINGS ────────────────────────────────────────

router.get("/share-holdings", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).shareHolding.findMany({
      where: getQueryWhere(req as any),
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch share holdings" });
  }
});

router.post("/share-holdings", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).shareHolding.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create share holding" });
  }
});

router.delete("/share-holdings/:id", async (req: Request, res: Response) => {
  try {
    await (prisma as any).shareHolding.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete share holding" });
  }
});

// ─── WITHDRAWAL REQUESTS ───────────────────────────────────

router.get("/withdrawal-requests", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).withdrawalRequest.findMany({
      where: getQueryWhere(req as any),
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch withdrawal requests" });
  }
});

router.post("/withdrawal-requests", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).withdrawalRequest.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create withdrawal request" });
  }
});

router.put(
  "/withdrawal-requests/:id/approve",
  async (req: Request, res: Response) => {
    try {
      const data = await (prisma as any).withdrawalRequest.update({
        where: { id: req.params.id },
        data: { status: "APPROVED" },
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve withdrawal" });
    }
  },
);

// ─── LOANS CRUD ────────────────────────────────────────────

router.get("/", async (req: Request, res: Response) => {
  try {
    const loans = await (prisma as any).loan.findMany({
      where: getQueryWhere(req as any),
      include: { guarantors: true, repayments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      memberId,
      memberName,
      productName,
      principal,
      interestRate,
      duration,
      interestMethod,
    } = req.body;
    const loan = await (prisma as any).loan.create({
      data: {
        chamaId: getPostChamaId(req as any),
        memberId,
        memberName,
        productName,
        principal,
        balance: principal,
        interestRate: interestRate || 12.0,
        duration: duration || 12,
        interestMethod: interestMethod || "REDUCING_BALANCE",
        status: "PENDING_GUARANTORS",
      },
    });
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: "Failed to create loan" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Also delete associated repayments and guarantors since prisma might not cascade depending on schema config
    await (prisma as any).loanRepayment.deleteMany({
      where: { loanId: req.params.id },
    });
    await (prisma as any).loanGuarantor.deleteMany({
      where: { loanId: req.params.id },
    });
    await (prisma as any).loan.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete loan" });
  }
});

// ─── GUARANTOR MANAGEMENT ──────────────────────────────────

router.get("/guarantors/all", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).loanGuarantor.findMany({
      where: getQueryWhere(req as any),
      include: { loan: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all guarantors" });
  }
});

router.get("/guarantors/me", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).loanGuarantor.findMany({
      where: { ...getQueryWhere(req as any), guarantorId: (req as any).user.id },
      include: { loan: true },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guarantorship requests" });
  }
});

router.post(
  "/:id/guarantors",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { guarantorId, guarantorName, amountGuaranteed } = req.body;

      if (guarantorId === (req as any).user.id) {
        return res
          .status(400)
          .json({ error: "Self-guaranteeing is not allowed" });
      }

      const guarantorUser = await prisma.user.findUnique({
        where: { id: guarantorId },
      });

      if (
        !guarantorUser ||
        (guarantorUser.role !== "MEMBER" &&
          guarantorUser.role !== "CHAMA_ADMIN")
      ) {
        return res.status(400).json({ error: "Invalid guarantor" });
      }

      const guarantorLedger = await prisma.ledger.findUnique({
        where: { userId: guarantorId },
      });

      if (
        !guarantorLedger ||
        guarantorLedger.savingsBalance < amountGuaranteed
      ) {
        return res
          .status(400)
          .json({
            error:
              "Guarantor does not have sufficient savings to cover this amount.",
          });
      }

      const guarantor = await (prisma as any).loanGuarantor.create({
        data: {
          chamaId: getPostChamaId(req as any),
          loanId: req.params.id,
          guarantorId,
          guarantorName,
          amountGuaranteed,
        },
      });
      // Check if enough guarantors to advance status
      const allGuarantors = await (prisma as any).loanGuarantor.findMany({
        where: {
          ...getQueryWhere(req as any),
          loanId: req.params.id,
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      });
      if (allGuarantors.length >= 3) {
        const loan = await (prisma as any).loan.findUnique({
          where: { id: req.params.id },
        });
        const totalGuaranteed = allGuarantors.reduce(
          (s: number, g: any) => s + g.amountGuaranteed,
          0,
        );
        if (totalGuaranteed >= loan.principal) {
          await (prisma as any).loan.update({
            where: { id: req.params.id },
            data: { status: "PENDING_APPROVAL" },
          });
        }
      }
      return res.status(201).json(guarantor);
    } catch (error) {
      return res.status(500).json({ error: "Failed to add guarantor" });
    }
  },
);

router.put("/guarantors/:gid/accept", async (req: Request, res: Response) => {
  try {
    const guarantor = await (prisma as any).loanGuarantor.update({
      where: { id: req.params.gid },
      data: { status: "ACCEPTED" },
    });
    res.json(guarantor);
  } catch (error) {
    res.status(500).json({ error: "Failed to accept guarantor" });
  }
});

router.put("/guarantors/:gid/reject", async (req: Request, res: Response) => {
  try {
    const guarantor = await (prisma as any).loanGuarantor.update({
      where: { id: req.params.gid },
      data: { status: "REJECTED" },
    });
    res.json(guarantor);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject guarantor" });
  }
});

// ─── LOAN LIFECYCLE ────────────────────────────────────────

router.put("/:id/approve", async (req: Request, res: Response) => {
  try {
    const loan = await (prisma as any).loan.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" },
    });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve loan" });
  }
});

router.put("/:id/reject", async (req: Request, res: Response) => {
  try {
    const loan = await (prisma as any).loan.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
    });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject loan" });
  }
});

router.put("/:id/disburse", async (req: Request, res: Response) => {
  try {
    const loan = await (prisma as any).loan.findUnique({
      where: { id: req.params.id },
    });
    if (!loan || loan.status !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Loan must be APPROVED to disburse" });
    }

    // Generate repayment schedule
    const monthlyRate = loan.interestRate / 100 / 12;
    const n = loan.duration;
    let repayments: any[] = [];

    if (loan.interestMethod === "AMORTIZED") {
      // PMT formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
      const pmt =
        (loan.principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1);
      let balance = loan.principal;
      for (let i = 1; i <= n; i++) {
        const interest = balance * monthlyRate;
        const principalPortion = pmt - interest;
        balance -= principalPortion;
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        repayments.push({
          loanId: loan.id,
          amount: Math.round(pmt),
          principalPortion: Math.round(principalPortion),
          interestPortion: Math.round(interest),
          dueDate,
        });
      }
    } else if (loan.interestMethod === "REDUCING_BALANCE") {
      const principalPortion = loan.principal / n;
      let balance = loan.principal;
      for (let i = 1; i <= n; i++) {
        const interest = balance * monthlyRate;
        balance -= principalPortion;
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        repayments.push({
          loanId: loan.id,
          amount: Math.round(principalPortion + interest),
          principalPortion: Math.round(principalPortion),
          interestPortion: Math.round(interest),
          dueDate,
        });
      }
    } else {
      // STRAIGHT_LINE
      const totalInterest =
        loan.principal * (loan.interestRate / 100) * (n / 12);
      const monthlyInstalment = (loan.principal + totalInterest) / n;
      const monthlyInterest = totalInterest / n;
      const principalPortion = loan.principal / n;
      for (let i = 1; i <= n; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        repayments.push({
          loanId: loan.id,
          amount: Math.round(monthlyInstalment),
          principalPortion: Math.round(principalPortion),
          interestPortion: Math.round(monthlyInterest),
          dueDate,
        });
      }
    }

    await (prisma as any).loanRepayment.createMany({ data: repayments });

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + n);

    const updated = await (prisma as any).loan.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE", disbursementDate: new Date(), dueDate },
      include: { repayments: true, guarantors: true },
    });

    // Auto-generate Journal Vouchers on Loan Disbursement (Double-Entry)
    await (prisma as any).journalVoucher.createMany({
      data: [
        {
          accountName: `Loan Receivable - ${loan.memberName}`,
          date: new Date(),
          narration: `Loan Disbursement to ${loan.memberName} for ${loan.productName}`,
          debit: loan.principal,
          credit: 0,
        },
        {
          accountName: `Bank/Cash Account`,
          date: new Date(),
          narration: `Loan Disbursement to ${loan.memberName} for ${loan.productName}`,
          debit: 0,
          credit: loan.principal,
        },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to disburse loan" });
  }
});

// ─── REPAYMENT ─────────────────────────────────────────────

router.put("/repayments/:rid/pay", async (req: Request, res: Response) => {
  try {
    const repayment = await (prisma as any).loanRepayment.update({
      where: { id: req.params.rid },
      data: { status: "PAID", paidDate: new Date() },
    });

    // Update loan balance
    const loan = await (prisma as any).loan.findUnique({
      where: { id: repayment.loanId },
    });
    const newBalance = loan.balance - repayment.principalPortion;
    const updateData: any = { balance: Math.max(0, newBalance) };

    // Check if fully paid
    const pendingRepayments = await (prisma as any).loanRepayment.findMany({
      where: {
        ...getQueryWhere(req as any),
        loanId: repayment.loanId,
        status: { in: ["PENDING", "OVERDUE", "PARTIAL"] },
      },
    });
    if (pendingRepayments.length === 0) {
      updateData.status = "PAID_OFF";
      updateData.balance = 0;
    }

    await (prisma as any).loan.update({
      where: { id: repayment.loanId },
      data: updateData,
    });
    res.json(repayment);
  } catch (error) {
    res.status(500).json({ error: "Failed to record repayment" });
  }
});

// ─── DYNAMIC ID ROUTES (MUST BE LAST) ──────────────────────

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const loan = await (prisma as any).loan.findUnique({
      where: { id: req.params.id },
      include: {
        guarantors: true,
        repayments: { orderBy: { dueDate: "asc" } },
      },
    });
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch loan" });
  }
});

export default router;
