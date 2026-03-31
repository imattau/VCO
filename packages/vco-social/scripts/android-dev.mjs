#!/usr/bin/env node
/**
 * android-dev.mjs
 *
 * Finds a free port, then starts `tauri android dev` with:
 *  - `--config` to override devUrl with the actual free port
 *  - `VITE_PORT` env var so vite.config.ts starts Vite on the same port
 *
 * Usage:  node scripts/android-dev.mjs [-- extra tauri args...]
 *         npm run android:dev
 *
 * For a real device (not emulator), pass --host so Tauri uses the
 * machine's LAN IP instead of localhost:
 *         npm run android:dev -- --host
 */
import { createServer } from 'net';
import { spawn } from 'child_process';

const args = process.argv.slice(2);

function findFreePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

const port = await findFreePort();
console.log(`[android-dev] Using port ${port}`);

// Pass devUrl override via --config JSON merge so the compiled app uses the right port
const configOverride = JSON.stringify({ build: { devUrl: `http://localhost:${port}` } });

const proc = spawn('npx', ['tauri', 'android', 'dev', '--config', configOverride, ...args], {
  env: {
    ...process.env,
    VITE_PORT: String(port),
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

proc.on('error', (err) => { console.error(err); process.exit(1); });
proc.on('exit', (code) => process.exit(code ?? 0));
