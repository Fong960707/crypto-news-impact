import { seedTestData } from './server/seedTestData.ts';

async function main() {
  try {
    console.log('[Demo Seed] Starting...');
    await seedTestData();
    console.log('[Demo Seed] ✓ Complete!');
    process.exit(0);
  } catch (e) {
    console.error('[Demo Seed] Error:', e);
    process.exit(1);
  }
}

main();
