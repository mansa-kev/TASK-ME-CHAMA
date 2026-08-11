const fs = require('fs');
const glob = require('glob');

const files = glob.sync('frontend/src/components/officials/*.tsx');

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('prompt(') && !code.includes('usePrompt')) {
    // 1. add import
    code = `import { usePrompt } from '../common/PromptProvider';\n` + code;
    
    // 2. inject const showPrompt = usePrompt();
    // find the component declaration
    const match = code.match(/export function (\w+)\(\) \{/);
    if (match) {
      const idx = match.index + match[0].length;
      code = code.substring(0, idx) + `\n  const showPrompt = usePrompt();\n` + code.substring(idx);
    }
    
    // 3. replace prompt( with await showPrompt(
    code = code.replace(/\bprompt\(/g, 'await showPrompt(');
    
    // 4. update handler functions to be async where prompt was used
    // This regex looks for patterns like: onClick={() => { or const handleX = () => {
    // and changes them to async if they contain await showPrompt
    // Since we replaced it already, we look for enclosing functions.
    // Actually, just replacing `() => {` with `async () => {` if it's near an await is hard with simple regex.
    // Let's do a broader replacement for common handler signatures in these files.
    
    code = code.replace(/const (handle[A-Za-z0-9_]+) = \(\) => {/g, 'const $1 = async () => {');
    code = code.replace(/const (handle[A-Za-z0-9_]+) = \(e: React\.FormEvent\) => {/g, 'const $1 = async (e: React.FormEvent) => {');
    code = code.replace(/const (handle[A-Za-z0-9_]+) = \(item: any\) => {/g, 'const $1 = async (item: any) => {');
    code = code.replace(/const (handle[A-Za-z0-9_]+) = \(id: string\) => {/g, 'const $1 = async (id: string) => {');
    code = code.replace(/onClick=\{\(\) => \{/g, 'onClick={async () => {');
    code = code.replace(/onClick=\{\(e\) => \{/g, 'onClick={async (e) => {');

    fs.writeFileSync(file, code);
    console.log(`Patched ${file}`);
  }
}
