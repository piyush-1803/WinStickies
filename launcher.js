/**
 * launcher.js
 * Direct Electron launcher that clears ELECTRON_RUN_AS_NODE before starting.
 * This prevents VS Code's integrated terminal from causing Electron to run
 * in plain Node.js mode (which makes require('electron') return a path string).
 */
const { spawn } = require('child_process');

// node_modules/electron/index.js exports the path to the electron binary
const electronBin = require('./node_modules/electron');

// Clone env and remove the VS Code terminal pollution
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBin, ['.'], {
  stdio: 'inherit',
  windowsHide: false,
  env,
});

child.on('close', (code) => process.exit(code || 0));
child.on('error', (err) => {
  console.error('[launcher] Failed to start Electron:', err.message);
  process.exit(1);
});
