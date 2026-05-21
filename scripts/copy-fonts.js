// Skript zkopíruje font DM Sans z @fontsource do public/fonts/
// Spustí se automaticky po `npm install`
const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

const src = path.join(__dirname, '..', 'node_modules', '@fontsource', 'dm-sans', 'files');

const files = [
  'dm-sans-latin-400-normal.woff2',
  'dm-sans-latin-500-normal.woff2',
  'dm-sans-latin-600-normal.woff2',
  'dm-sans-latin-700-normal.woff2',
  'dm-sans-latin-800-normal.woff2',
  'dm-sans-latin-400-normal.woff',
  'dm-sans-latin-500-normal.woff',
  'dm-sans-latin-600-normal.woff',
  'dm-sans-latin-700-normal.woff',
  'dm-sans-latin-800-normal.woff',
];

let copied = 0;
for (const file of files) {
  const srcPath = path.join(src, file);
  const destPath = path.join(dest, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Zkopírován font: ${file}`);
    copied++;
  } else {
    console.warn(`⚠ Font nenalezen: ${srcPath}`);
  }
}

if (copied > 0) {
  console.log(`\n✅ Fonty zkopírovány do public/fonts/ (${copied}/${files.length})`);
} else {
  console.warn('\n⚠ Žádné fonty nebyly zkopírovány – PDF export bude používat Helvetica');
}
