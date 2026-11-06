const fs = require('fs');

const fullController = require('./full_client_controller.js');
const indexPath = 'c:/Users/its mee u know/Downloads/rahul dt/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Find the main <script> tag (starts with <script>\n    // --- DARK MODE or <script>\n    const DEFAULT_CAMPUS_HERO)
const scriptIdx = html.indexOf('<script>\n    // --- DARK MODE');
let cutPos = scriptIdx;
if (cutPos === -1) {
  cutPos = html.indexOf('<script>\n    const DEFAULT_CAMPUS_HERO');
}
if (cutPos === -1) {
  // Find last <script>
  cutPos = html.lastIndexOf('<script>');
}

if (cutPos !== -1) {
  const before = html.substring(0, cutPos);
  const after = '\n</body></html>';
  html = before + fullController.trim() + after;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Successfully injected new client controller into index.html! New length:', html.length);
} else {
  console.error('Could not locate script tag in index.html');
}
