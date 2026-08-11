import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { signS3Url, stripSignatureFromUrl } from '../utils/s3';

export const getMembers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    
    if (!dbUser?.chamaId && user.role !== 'TCM_SUPER_ADMIN') {
       return res.status(403).json({ error: 'User is not assigned to a Chama' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause = user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId };

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: { ledger: { include: { transactions: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const signedMembers = await Promise.all(members.map(async (m) => ({
      ...m,
      profilePicture: await signS3Url(m.profilePicture),
      idDocument: await signS3Url(m.idDocument),
      passportPhoto: await signS3Url(m.passportPhoto),
      idFront: await signS3Url(m.idFront),
      idBack: await signS3Url(m.idBack),
    })));

    res.json({
      data: signedMembers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const { name, email, role, chamaId: bodyChamaId, idNumber, kraPin, gender, dateOfBirth, phone, address, nextOfKinName, nextOfKinRelation, nextOfKinPhone, passportPhoto, idFront, idBack } = req.body;
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    let targetChamaId = dbUser?.chamaId;
    
    if ((user.role === 'TCM_SUPER_ADMIN' || user.role === 'TCM_ADMIN') && bodyChamaId) {
      targetChamaId = bodyChamaId;
    }

    if (!targetChamaId) {
      return res.status(400).json({ error: 'Must belong to a Chama or provide chamaId to create members' });
    }

    const temporaryPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newMember = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
        chamaId: targetChamaId,
        idNumber,
        kraPin,
        phone,
        address,
        nextOfKinName,
        nextOfKinRelation,
        nextOfKinPhone,
        passportPhoto: stripSignatureFromUrl(passportPhoto) || undefined,
        idFront: stripSignatureFromUrl(idFront) || undefined,
        idBack: stripSignatureFromUrl(idBack) || undefined,
        ledger: {
          create: {
            chamaId: targetChamaId,
            savingsBalance: 0,
            sharesBalance: 0,
            activeLoanBalance: 0,
          }
        },
        requiresPasswordChange: true
      },
      include: { ledger: true }
    });

    res.status(201).json({ ...newMember, temporaryPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetMemberPasswordAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = (req as any).user;
    
    if (user.role !== 'TCM_SUPER_ADMIN' && user.role !== 'TCM_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to reset credentials' });
    }

    const temporaryPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        requiresPasswordChange: true
      }
    });

    res.json({ email: updatedUser.email, temporaryPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { 
        ledger: { 
          include: { 
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 20
            } 
          } 
        } 
      }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pendingFines = await prisma.disciplinaryRecord.findMany({
      where: { memberId: user.id, status: 'PENDING', type: 'FINE' }
    });
    const finesBalance = pendingFines.reduce((sum, f) => sum + (f.amount || 0), 0);

    const signedUser = {
      ...dbUser,
      finesBalance,
      pendingFines,
      profilePicture: await signS3Url(dbUser.profilePicture),
      idDocument: await signS3Url(dbUser.idDocument),
      passportPhoto: await signS3Url(dbUser.passportPhoto),
      idFront: await signS3Url(dbUser.idFront),
      idBack: await signS3Url(dbUser.idBack),
    };

    res.json(signedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateKyc = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { idNumber, kraPin, phone, address, nextOfKinName, nextOfKinRelation, nextOfKinPhone, profilePicture, idDocument, passportPhoto, idFront, idBack } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        idNumber: idNumber || undefined,
        kraPin: kraPin || undefined,
        phone: phone || undefined,
        address: address || undefined,
        nextOfKinName: nextOfKinName || undefined,
        nextOfKinRelation: nextOfKinRelation || undefined,
        nextOfKinPhone: nextOfKinPhone || undefined,
        profilePicture: stripSignatureFromUrl(profilePicture) || undefined,
        idDocument: stripSignatureFromUrl(idDocument) || undefined,
        passportPhoto: stripSignatureFromUrl(passportPhoto) || undefined,
        idFront: stripSignatureFromUrl(idFront) || undefined,
        idBack: stripSignatureFromUrl(idBack) || undefined
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMemberKycAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { 
      idNumber, kraPin, phone, address, nextOfKinName, nextOfKinRelation, nextOfKinPhone,
      profilePicture, idDocument, passportPhoto, idFront, idBack 
    } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        idNumber: idNumber || undefined,
        kraPin: kraPin || undefined,
        phone: phone || undefined,
        address: address || undefined,
        nextOfKinName: nextOfKinName || undefined,
        nextOfKinRelation: nextOfKinRelation || undefined,
        nextOfKinPhone: nextOfKinPhone || undefined,
        profilePicture: stripSignatureFromUrl(profilePicture) || undefined,
        idDocument: stripSignatureFromUrl(idDocument) || undefined,
        passportPhoto: stripSignatureFromUrl(passportPhoto) || undefined,
        idFront: stripSignatureFromUrl(idFront) || undefined,
        idBack: stripSignatureFromUrl(idBack) || undefined
      }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Update Member KYC Admin Error:', error);
    res.status(500).json({ error: 'Failed to update member KYC details' });
  }
};

export const updateMySettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { password, notifications } = req.body;
    
    const updateData: any = {};
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // In a real app we'd save notifications preferences too, maybe in a settings JSON field on User or MemberInfo
    // For now we just update password
    
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update My Settings Error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getMemberShares = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shares = await prisma.shareHolding.findMany({ where: { memberId: id }, orderBy: { createdAt: 'desc' } });
    const formattedShares = shares.map(s => ({
      date: s.createdAt.toISOString().split('T')[0],
      type: s.shareType,
      shares: s.units,
      amount: s.units * s.valuePerUnit
    }));
    res.json(formattedShares);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMemberAudit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const auditLogs = await prisma.auditLog.findMany({ where: { userId: id } });
    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const memberDeposit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount, type } = req.body;
    const ledger = await prisma.ledger.findUnique({ where: { userId: id } });
    if (!ledger) return res.status(404).json({ error: 'Ledger not found' });
    
    if (type === 'SHARES') {
      await prisma.ledger.update({
        where: { userId: id },
        data: { sharesBalance: { increment: amount } }
      });

      const user = await prisma.user.findUnique({ where: { id } });
      if (user && user.chamaId) {
        await prisma.shareHolding.create({
          data: {
            chamaId: user.chamaId,
            memberId: id,
            memberName: user.name,
            shareType: 'ORDINARY',
            units: Math.floor(amount / 100),
            valuePerUnit: 100
          }
        });
      }

      await prisma.transaction.create({
        data: {
          ledgerId: ledger.id,
          type: 'SHARES',
          amount: amount,
          reference: `SHR-${Date.now()}`
        }
      });
    } else {
      await prisma.ledger.update({
        where: { userId: id },
        data: { savingsBalance: { increment: amount } }
      });
      
      await prisma.transaction.create({
        data: {
          ledgerId: ledger.id,
          type: 'SAVINGS',
          amount: amount,
          reference: `DEP-${Date.now()}`
        }
      });
    }

    res.json({ success: true, amount });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const memberDisburse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount } = req.body;
    const ledger = await prisma.ledger.findUnique({ where: { userId: id } });
    if (!ledger) return res.status(404).json({ error: 'Ledger not found' });

    await prisma.ledger.update({
      where: { userId: id },
      data: { activeLoanBalance: { increment: amount } }
    });
    
    await prisma.transaction.create({
      data: {
        ledgerId: ledger.id,
        type: 'LOAN_DISBURSEMENT',
        amount: amount,
        reference: `DIS-${Date.now()}`
      }
    });
    res.json({ success: true, amount });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const memberPenalty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount, reason } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.chamaId) return res.status(404).json({ error: 'User or Chama not found' });

    const penalty = await prisma.disciplinaryRecord.create({
      data: {
        chamaId: user.chamaId,
        memberId: id,
        type: 'FINE',
        reason: reason || 'Penalty',
        amount: amount
      }
    });
    res.json(penalty);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyFines = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const fines = await prisma.disciplinaryRecord.findMany({
      where: { memberId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    const pendingBalance = fines.filter(f => f.status === 'PENDING').reduce((sum, f) => sum + (f.amount || 0), 0);
    res.json({ fines, pendingBalance });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportMemberSavingsCsv = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const ledger = await prisma.ledger.findUnique({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ledger) {
      return res.status(404).json({ error: 'Ledger not found' });
    }

    const headers = ['Date', 'Transaction ID', 'Type', 'Amount (KES)', 'Reference'];
    const rows = ledger.transactions.map(t => [
      `"${new Date(t.createdAt).toISOString().split('T')[0]}"`,
      `"${t.id}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.reference || ''}"`
    ].join(','));

    const csvString = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=savings_statement_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvString);
  } catch (error) {
    console.error('Export savings CSV error:', error);
    res.status(500).json({ error: 'Failed to export statement' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, role, status } = req.body;
    const user = (req as any).user;
    
    // Additional authorization checks can be added here if needed

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        role,
        ...(status && { status })
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
};

export const updateMemberStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE', 'SUSPENDED', etc.

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({ error: 'Failed to update member status' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const memberLedger = await prisma.ledger.findUnique({
      where: { userId: id }
    });

    if (memberLedger) {
      if (memberLedger.activeLoanBalance > 0 || memberLedger.savingsBalance > 0 || memberLedger.sharesBalance > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete member with active balances. Please clear savings, shares, and loans first.' 
        });
      }
    }

    // Wrap deletions in a transaction to handle foreign key constraints manually since onDelete: Cascade isn't set
    await prisma.$transaction(async (tx) => {
      // Delete KycDocument if exists
      await tx.kycDocument.deleteMany({ where: { userId: id } });
      
      // Delete Ledger if exists
      await tx.ledger.deleteMany({ where: { userId: id } });
      
      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
};
