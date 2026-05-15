import { fetchAndStoreNews } from './server/newsFetcher.ts';
import { runAnalysisBatch } from './server/aiAnalyzer.ts';

async function main() {
  try {
    console.log('[Seed] Starting news fetch...');
    const fetched = await fetchAndStoreNews();
    console.log(`[Seed] ✓ Fetched ${fetched} news articles`);

    console.log('[Seed] Starting AI analysis...');
    const analyzed = await runAnalysisBatch(10);
    console.log(`[Seed] ✓ Analyzed ${analyzed} articles`);

    console.log('[Seed] Done!');
    process.exit(0);
  } catch (e) {
    console.error('[Seed] Error:', e);
    process.exit(1);
  }
}

main();
