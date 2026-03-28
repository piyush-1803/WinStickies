const { spawn } = require('child_process');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
env.ELECTRON_ENABLE_LOGGING = "1";
const child = spawn('npm.cmd', ['start'], { env, stdio: 'inherit', shell: true });
child.on('exit', code => process.exit(code));
