import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || argv.includes('-n'),
    verbose: argv.includes('--verbose') || argv.includes('-v'),
  };
}

async function syncApiBase({ dryRun, verbose }) {
  const packageDir = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(packageDir, '../..');
  const sourceApiDir = path.join(repoRoot, 'scaffold', 'packages', 'api');
  const targetApiBaseDir = path.join(packageDir, 'templates', 'api-base');

  if (!(await fs.pathExists(sourceApiDir))) {
    throw new Error(`source api directory not found: ${sourceApiDir}`);
  }

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log('[dry-run] sync api-base template');
    // eslint-disable-next-line no-console
    console.log(`[dry-run]   from: ${sourceApiDir}`);
    // eslint-disable-next-line no-console
    console.log(`[dry-run]   to:   ${targetApiBaseDir}`);
    return;
  }

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`syncing api-base from: ${sourceApiDir}`);
  }

  await fs.remove(targetApiBaseDir);
  await fs.copy(sourceApiDir, targetApiBaseDir, {
    filter: (src) => {
      const name = path.basename(src);
      if (name === 'node_modules') return false;
      if (name === 'dist') return false;
      if (name === '.next') return false;
      if (name.endsWith('.log')) return false;
      return true;
    },
  });

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`synced api-base to: ${targetApiBaseDir}`);
  }
}

const { dryRun, verbose } = parseArgs(process.argv.slice(2));
syncApiBase({ dryRun, verbose }).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
