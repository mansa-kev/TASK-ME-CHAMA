"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arrearsEngine_1 = require("./cron/arrearsEngine");
console.log('🚀 Starting Task-Me Chama Background Worker...');
try {
    (0, arrearsEngine_1.startArrearsEngine)();
    console.log('✅ Background Worker is running');
}
catch (error) {
    console.error('❌ Failed to start background worker:', error);
    process.exit(1);
}
//# sourceMappingURL=worker.js.map