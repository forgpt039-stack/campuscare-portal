const fs = require('fs');

const html = fs.readFileSync('c:/Users/its mee u know/Downloads/rahul dt/index.html', 'utf8');

const scriptIdx = html.indexOf('<script>\n    // --- DARK MODE');
console.log('script starts at:', scriptIdx);
console.log('before script (last 500 chars):');
console.log(html.substring(scriptIdx - 500, scriptIdx));
