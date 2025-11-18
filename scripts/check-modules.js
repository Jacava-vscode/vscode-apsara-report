const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error('Unable to find package.json at', pkgPath);
  process.exit(2);
}

const pkg = require(pkgPath);
const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
const missing = [];

Object.keys(deps).forEach((dep) => {
  try {
    require.resolve(dep);
  } catch (err) {
    missing.push(dep);
  }
});

if (missing.length === 0) {
  console.log('All dependencies appear to be installed.');
  process.exit(0);
}

console.error('Missing modules detected:');
missing.forEach((m) => console.error('  -', m));
console.error('\nTry running `npm install` in the repo root, or `npm ci` for a fresh install.');
process.exit(1);
