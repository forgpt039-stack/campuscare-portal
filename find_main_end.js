const fs = require('fs');

const html = fs.readFileSync('c:/Users/its mee u know/Downloads/rahul dt/index.html', 'utf8');

const mainIdx = html.indexOf('<!-- 3. MAIN APPLICATION CONTAINER');
console.log('main container starts at:', mainIdx);

// Look for bottom navigation
const navIdx = html.indexOf('<!-- Bottom Floating App Nav Bar');
console.log('bottom nav at:', navIdx);
console.log(html.substring(navIdx, navIdx + 1200));
