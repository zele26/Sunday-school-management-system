const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') results = results.concat(walk(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('.');
console.log(`Validating ${files.length} JavaScript files in church-server...`);
let errors = 0;
files.forEach(f => {
  try {
    execSync(`node -c "${f}"`);
  } catch (err) {
    console.error(`Syntax error in ${f}:`, err.message);
    errors++;
  }
});
if (errors === 0) {
  console.log(`✅ All ${files.length} backend files passed syntax validation!`);
} else {
  console.error(`❌ ${errors} files failed syntax validation.`);
  process.exit(1);
}
