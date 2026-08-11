const fs = require('fs');
const path = 'backend/src/controllers/submodules.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /export const getCommunicationlogs = async \(req: Request, res: Response\) => \{[\s\S]*?res\.json\(data\);[\s\S]*?\} catch \(error\) \{[\s\S]*?\}\n\};/;

const replacement = `export const getCommunicationlogs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    // Filter by recipient string matching user's phone or email
    // Or just fetch all if admin, otherwise filter
    let where = {};
    if (user.role !== 'TCM_SUPER_ADMIN' && user.role !== 'CHAMA_ADMIN') {
       where = {
         OR: [
           { recipient: { contains: user.email } }
         ]
       };
    }
    const data = await (prisma as any).communicationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch communicationLogs" });
  }
};`;

code = code.replace(regex, replacement);
fs.writeFileSync(path, code);
