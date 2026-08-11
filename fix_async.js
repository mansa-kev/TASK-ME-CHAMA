const fs = require('fs');
const glob = require('glob');

const files = glob.sync('frontend/src/components/officials/*.tsx');

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // This regex matches an arrow function assignment `const name = (args) => {` 
  // where the body contains `await showPrompt` and changes it to `const name = async (args) => {`
  code = code.replace(/const (\w+) = \(([^)]*)\) => \{([\s\S]*?)await showPrompt/g, 'const $1 = async ($2) => {$3await showPrompt');
  
  fs.writeFileSync(file, code);
}
