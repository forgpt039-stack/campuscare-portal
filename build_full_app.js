const fs = require('fs');
const path = require('path');

const adminTemplate = require('./admin_template.js');
const indexPath = 'c:/Users/its mee u know/Downloads/rahul dt/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Ensure student app container has id="student-app-view"
html = html.replace(
  '<div class="w-full flex-1 flex flex-col bg-white max-w-4xl mx-auto shadow-sm min-h-screen relative pb-20">',
  '<div id="student-app-view" class="w-full flex-1 flex flex-col bg-white max-w-4xl mx-auto shadow-sm min-h-screen relative pb-20">'
);

// 2. Remove Quick Touch from login page if any traces remain
html = html.replace(/<button[^>]*onclick="simulateBiometric\(\)"[^>]*>[\s\S]*?<\/button>/gi, '');
html = html.replace(/<!-- Biometric Shortcut -->[\s\S]*?<!-- \/Biometric Shortcut -->/gi, '');

// 3. Remove Transit option if any traces remain
html = html.replace(/<button[^>]*launchReportWithCategory\(['"]Transportation['"]\)[\s\S]*?<\/button>/gi, '');

// 4. Update Priority in report screen to include Critical / Hazard
const oldPriorityHtml = `<div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Priority Classification</label>
            <div class="grid grid-cols-4 gap-2">
              <label class="cursor-pointer"><input type="radio" name="priority" value="Low" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border peer-checked:bg-slate-100">Low</div></label>
              <label class="cursor-pointer"><input type="radio" name="priority" value="Medium" checked="" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border peer-checked:bg-blue-50 peer-checked:border-brand-500 peer-checked:text-brand-700">Medium</div></label>
              <label class="cursor-pointer"><input type="radio" name="priority" value="High" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700">High</div></label>
              <label class="cursor-pointer"><input type="radio" name="priority" value="SOS" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700 sos-glow">🚨 SOS</div></label>
            </div>
          </div>`;

const newPriorityHtml = `<div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Priority Classification *</label>
            <div class="grid grid-cols-4 gap-2">
              <label class="cursor-pointer"><input type="radio" name="priority" value="Low" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border border-slate-200 dark:border-slate-700 peer-checked:bg-slate-100 dark:peer-checked:bg-slate-800">Low</div></label>
              <label class="cursor-pointer"><input type="radio" name="priority" value="Medium" checked class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border border-slate-200 dark:border-slate-700 peer-checked:bg-blue-50 peer-checked:border-brand-500 peer-checked:text-brand-700">Medium</div></label>
              <label class="cursor-pointer"><input type="radio" name="priority" value="High" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border border-slate-200 dark:border-slate-700 peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700">High</div></label>
              <label class="cursor-pointer"><input type="radio" name="priority" value="Critical" class="hidden peer"><div class="p-2 rounded-xl text-center text-xs font-bold border border-rose-200 peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700 animate-pulse">🚨 Critical</div></label>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Student Department</label>
              <input type="text" id="report-input-dept" value="Computer Science & Engineering" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Class / Year</label>
              <input type="text" id="report-input-class" value="3rd Year - Section B" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
            </div>
          </div>`;

if (html.includes(oldPriorityHtml)) {
  html = html.replace(oldPriorityHtml, newPriorityHtml);
}

// 5. Update category dropdown / input in report screen
const locationHtmlOld = `<div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Location Details *</label>`;

const locationHtmlNew = `<div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Complaint Category *</label>
            <select id="report-input-category" class="w-full mb-3 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100">
              <option value="IT & Audio-Visual">IT & Audio-Visual (Projector, Smart Board, Audio, Wi-Fi)</option>
              <option value="Electrical">Electrical (Power cut, live wires, switchboards, fans)</option>
              <option value="Plumbing">Plumbing & Water (Leakage, taps, washrooms, RO coolers)</option>
              <option value="Hostel & Living">Hostel & Living (Furniture, locks, lighting, beds)</option>
              <option value="Civil Infrastructure">Civil Infrastructure (Broken doors, windows, tiles, masonry)</option>
              <option value="Safety & Security">Safety & Security (Hazardous items, lighting, perimeter)</option>
              <option value="Lab Facilities">Lab Facilities (Equipments, chemicals, benches)</option>
              <option value="Cleanliness & Sanitation">Cleanliness & Sanitation (Garbage, dustbins, hygiene)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Location Details *</label>`;

if (!html.includes('id="report-input-category"')) {
  html = html.replace(locationHtmlOld, locationHtmlNew);
}

// 6. Add Detailed Description textarea if not already present
const descOld = `<input type="text" id="report-input-room" placeholder="Room/Lab No. (e.g. Room 204)" class="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium">
            </div>
          </div>`;

const descNew = `<input type="text" id="report-input-room" placeholder="Room/Lab No. (e.g. Room 204)" class="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Detailed Description of Issue *</label>
            <textarea id="report-input-desc" rows="3" required placeholder="Describe the problem in detail (e.g., when it started, symptoms, hazards, equipment model)..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"></textarea>
          </div>`;

if (!html.includes('id="report-input-desc"')) {
  html = html.replace(descOld, descNew);
}

// 7. Update file input to accept video as well
html = html.replace('accept="image/*"', 'accept="image/*,video/*"');

// 8. Insert Admin Dashboard Template right before <script>
if (!html.includes('id="admin-app-view"')) {
  const scriptPos = html.indexOf('<!-- 7. COMPLETE WORKING JAVASCRIPT CONTROLLER');
  if (scriptPos !== -1) {
    html = html.substring(0, scriptPos) + adminTemplate + '\n\n  ' + html.substring(scriptPos);
    console.log('Successfully inserted Admin Dashboard template into HTML!');
  } else {
    // fallback before <script>
    const sPos = html.indexOf('<script>\n    // --- DARK MODE');
    html = html.substring(0, sPos) + adminTemplate + '\n\n  ' + html.substring(sPos);
    console.log('Inserted Admin Dashboard template before script tag!');
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Saved markup updates to index.html');
