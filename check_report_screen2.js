const fs = require('fs');

const html = fs.readFileSync('c:/Users/its mee u know/Downloads/rahul dt/index.html', 'utf8');

const reportIdx = html.indexOf('id="screen-report"');
console.log(html.substring(reportIdx + 1900, reportIdx + 4500));
