#!/usr/bin/env node
const { generateApiClient, watchApiClient } = require('@ai-partner-x/aiko-boot-codegen');

const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');
const isForce = process.argv.includes('--force') || process.argv.includes('-f');

if (isWatch) {
  watchApiClient();
} else {
  generateApiClient({ force: isForce });
}
