const fs = require('fs');
const path = './backend/src/routes/loans.ts';
let content = fs.readFileSync(path, 'utf8');

const staticRoutes = [
  '// ─── SAVINGS ACCOUNTS ──────────────────────────────────────',
  '// ─── SHARE HOLDINGS ────────────────────────────────────────',
  '// ─── INVESTMENTS ───────────────────────────────────────────',
  '// ─── FIXED DEPOSITS ────────────────────────────────────────',
  '// ─── WITHDRAWAL REQUESTS ───────────────────────────────────'
];

let mainIndex = content.indexOf('// ─── LOANS CRUD ────────────────────────────────────────────');

// We will extract everything from SAVINGS ACCOUNTS to the end of the file (before export default router;)
const savingsIndex = content.indexOf(staticRoutes[0]);
const exportIndex = content.indexOf('export default router;');

if (savingsIndex !== -1 && exportIndex !== -1) {
  const staticContent = content.substring(savingsIndex, exportIndex);
  // Remove the staticContent from the original position
  content = content.substring(0, savingsIndex) + content.substring(exportIndex);
  
  // Insert staticContent just after router.use(authMiddleware);
  const insertIndex = content.indexOf('router.use(authMiddleware);') + 'router.use(authMiddleware);'.length + 1;
  content = content.substring(0, insertIndex) + '\n\n' + staticContent + content.substring(insertIndex);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully reordered routes!");
} else {
  console.log("Could not find boundaries.");
}
