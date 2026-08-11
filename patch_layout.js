const fs = require('fs');

const path = 'frontend/src/components/OfficialsLayout.tsx';
let code = fs.readFileSync(path, 'utf8');

code = "import { PromptProvider } from './common/PromptProvider';\n" + code;
code = code.replace(/<div className="h-screen w-full bg-bg-app p-2 sm:p-4 flex gap-4 overflow-hidden relative">/, `<PromptProvider>\n    <div className="h-screen w-full bg-bg-app p-2 sm:p-4 flex gap-4 overflow-hidden relative">`);
code = code.replace(/<\/div>\n  \);\n\}/, `    </div>\n    </PromptProvider>\n  );\n}`);

fs.writeFileSync(path, code);
