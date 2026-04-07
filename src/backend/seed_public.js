import { execSync } from 'node:child_process';

execSync('node scripts/seed.js public', { stdio: 'inherit' });