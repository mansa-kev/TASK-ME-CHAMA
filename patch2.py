import re

# MemberProfile.tsx
with open('frontend/src/components/MemberProfile.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace("fetchLoans, resetMemberPassword }", "fetchLoans, resetMemberPassword, getMemberShares, getMemberAuditLogs, postMemberDeposit, disburseMemberLoan, applyMemberPenalty }")

state_hook = """  const [newCredentials, setNewCredentials] = useState<{ email: string, temporaryPassword: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [shareHoldings, setShareHoldings] = useState<any[]>([]);
"""
content = content.replace("  const [newCredentials, setNewCredentials] = useState<{ email: string, temporaryPassword: string } | null>(null);", state_hook)

effect_hook = """
    getMemberShares(id).then(data => data && setShareHoldings(data)).catch(console.error);
    getMemberAuditLogs(id).then(data => data && setAuditLogs(data)).catch(console.error);
"""
content = content.replace("}).catch(err => console.error(err));", "}).catch(err => console.error(err));\n" + effect_hook)

content = content.replace("  const auditLogs: any[] = [];\n", "")
content = content.replace("  const shareHoldings: any[] = [];\n", "")

# Fix buttons
content = content.replace(
"""<button className="w-full bg-brand-accent hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">Post Deposit</button>""",
"""<button onClick={() => postMemberDeposit(id || '', { amount: 1000 }).then(() => toast.success('Deposit posted')).catch(() => toast.error('Failed to post deposit'))} className="w-full bg-brand-accent hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">Post Deposit</button>"""
)

content = content.replace(
"""<button className="w-full bg-brand-green hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">Disburse Funds</button>""",
"""<button onClick={() => disburseMemberLoan(id || '', { loanId: 'dev-loan' }).then(() => toast.success('Funds disbursed')).catch(() => toast.error('Failed to disburse funds'))} className="w-full bg-brand-green hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">Disburse Funds</button>"""
)

content = content.replace(
"""<button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm">Apply Fee</button>""",
"""<button onClick={() => applyMemberPenalty(id || '', { amount: 500, reason: 'Late' }).then(() => toast.success('Fee applied')).catch(() => toast.error('Failed to apply fee'))} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm">Apply Fee</button>"""
)

with open('frontend/src/components/MemberProfile.tsx', 'w') as f:
    f.write(content)

