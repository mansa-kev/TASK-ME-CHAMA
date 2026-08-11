import { startArrearsEngine } from './cron/arrearsEngine';

console.log('🚀 Starting Task-Me Chama Background Worker...');

try {
  startArrearsEngine();
  console.log('✅ Background Worker is running');
} catch (error) {
  console.error('❌ Failed to start background worker:', error);
  process.exit(1);
}
