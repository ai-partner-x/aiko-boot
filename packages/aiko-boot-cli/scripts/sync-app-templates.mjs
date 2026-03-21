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

async function syncAppTemplates({ dryRun, verbose }) {
  const packageDir = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(packageDir, '../..');
  const scaffoldPackages = path.join(repoRoot, 'scaffold', 'packages');
  const templatesRoot = path.join(packageDir, 'templates');

  const mappings = [
    { srcName: 'admin', destName: 'app-admin', removeEnvModes: true },
    { srcName: 'mobile', destName: 'app-mobile', removeEnvModes: true },
    { srcName: 'core', destName: 'app-core', removeEnvModes: false },
  ];
  for (const { srcName, destName, removeEnvModes } of mappings) {
    const src = path.join(scaffoldPackages, srcName);
    const dest = path.join(templatesRoot, destName);
    if (!(await fs.pathExists(src))) {
      throw new Error(`source not found: ${src}`);
    }
    if (dryRun) {
      // eslint-disable-next-line no-console
      console.log(`[dry-run] sync ${srcName} => ${destName}: ${src} -> ${dest}`);
      continue;
    }
    if (verbose) {
      // eslint-disable-next-line no-console
      console.log(`sync ${srcName} => ${destName}: ${src} -> ${dest}`);
    }
    await fs.remove(dest);
    await fs.copy(src, dest, {
      filter: (p) => {
        const name = path.basename(p);
        if (name === 'node_modules') return false;
        if (name === 'dist') return false;
        if (name === '.next') return false;
        if (name.endsWith('.log')) return false;
        return true;
      },
    });

    if (removeEnvModes) {
      await fs.remove(path.join(dest, '.env.dev'));
      await fs.remove(path.join(dest, '.env.stage'));
      await fs.remove(path.join(dest, '.env.prod'));
    }
  }
}

const { dryRun, verbose } = parseArgs(process.argv.slice(2));
syncAppTemplates({ dryRun, verbose }).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
