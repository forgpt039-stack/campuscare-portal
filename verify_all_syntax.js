const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('c:/Users/its mee u know/Downloads/rahul dt/index.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code.length > 0) {
    try {
      new vm.Script(code);
      console.log(`Script #${i} (length: ${code.length}): SYNTAX VALID ✓`);
    } catch (e) {
      console.error(`Script #${i} SYNTAX ERROR:`, e.message);
      errors++;
    }
  }
  i++;
}

console.log(`Syntax check completed with ${errors} errors.`);
