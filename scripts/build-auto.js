#!/usr/bin/env node
/**
 * build-auto.js - Smart build script for Cloudflare Pages
 * Detects branch and runs appropriate build:
 * - v2 branch → build:v2 (new provenance system)
 * - main/other → build (legacy system)
 */

const { execSync } = require('child_process');

const branch = process.env.CF_PAGES_BRANCH ||
               execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

console.log(`\n🔍 Detected branch: ${branch}`);

if (branch === 'v2') {
  console.log('📦 Running v2 build (provenance system)...\n');
  execSync('node scripts/build-v2.js', { stdio: 'inherit' });
} else {
  console.log('📦 Running legacy build...\n');
  execSync('npx eluno-build', { stdio: 'inherit' });
}

console.log('\n✅ Build complete!');
