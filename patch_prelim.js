const fs = require('fs');

const path = 'c:/Users/its mee u know/Downloads/rahul dt/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Remove Quick Touch from login page
const quickTouchRegex = /<!-- Biometric Shortcut -->[\s\S]*?<!-- \/Biometric Shortcut -->|<!-- Biometric Shortcut -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- OTP Verification/i;
// Let's do exact match replacement
const qtExact = `      <!-- Biometric Shortcut -->
      <div class="mt-4 pt-4 border-t border-slate-100 text-center">
        <button type="button" onclick="simulateBiometric()" class="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition">
          <span>📲</span>
          <span>Quick Touch ID / FaceID Passkey</span>
        </button>
      </div>`;

if (html.includes(qtExact)) {
  html = html.replace(qtExact, '');
  console.log('Removed Quick Touch button successfully');
} else {
  // regex fallback
  html = html.replace(/<button[^>]*onclick="simulateBiometric\(\)"[^>]*>[\s\S]*?<\/button>/gi, '');
  console.log('Removed Quick Touch button via regex');
}

// 2. Remove Transit from Quick Report section
const transitExact = `            <button onclick="launchReportWithCategory('Transportation')" class="flex flex-col items-center p-2 rounded-2xl bg-pink-50 hover:bg-pink-100/70 border border-pink-100/60 transition active:scale-95">
              <div class="w-10 h-10 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center mb-1 text-lg">🚌</div>
              <span class="text-[10.5px] font-semibold text-slate-700">Transit</span>
            </button>`;

if (html.includes(transitExact)) {
  html = html.replace(transitExact, '');
  console.log('Removed Transit category successfully');
} else {
  html = html.replace(/<button[^>]*launchReportWithCategory\(['"]Transportation['"]\)[\s\S]*?<\/button>/gi, '');
  console.log('Removed Transit category via regex');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Saved preliminary removals to index.html');
