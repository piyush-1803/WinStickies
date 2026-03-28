const e = require('electron');
const fs = require('fs');
const out = {
  typeofE: typeof e,
  isNull: e === null,
  keys: e && typeof e === 'object' ? Object.keys(e).slice(0, 20) : String(e).slice(0, 200),
  hasApp: e && typeof e.app !== 'undefined',
  typeofApp: e ? typeof e.app : 'N/A',
};
fs.writeFileSync(__dirname + '/diag-out.json', JSON.stringify(out, null, 2));
process.exit(0);
