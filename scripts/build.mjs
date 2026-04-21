import {spawnSync} from 'node:child_process';

const isCloudflarePages = process.env.CF_PAGES === '1';
const isVercelBuildStep = process.env.VERCEL === '1';
const command = isCloudflarePages && !isVercelBuildStep ? 'next-on-pages' : 'next build';

const result = spawnSync(command, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
