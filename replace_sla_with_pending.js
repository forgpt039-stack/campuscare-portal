const fs = require('fs');

const path = 'c:/Users/its mee u know/Downloads/rahul dt/index.html';
let html = fs.readFileSync(path, 'utf8');

// Replacements
html = html.replace(/Pending\s*&amp;\s*Overdue\s*\(\s*Service\s*Level\s*Agreement\s*-\s*SLA\s*\)/gi, 'Pending Complaints');
html = html.replace(/Pending\s*\/\s*Service\s*Level\s*Agreement\s*\(\s*SLA\s*\)/gi, 'Pending');
html = html.replace(/Service\s*Level\s*Agreement\s*\(\s*SLA\s*\)/gi, 'Pending');
html = html.replace(/Service\s*Level\s*Agreement\s*-\s*SLA/gi, 'Pending');
html = html.replace(/Overdue\s*Service\s*Level\s*Agreement\s*\(\s*SLA\s*\)/gi, 'Pending Complaints');
html = html.replace(/⏱️\s*EXPIRED\s*\(\s*Past\s*24h\s*Service\s*Level\s*Agreement\s*-\s*SLA\s*\)/gi, '⏱️ PENDING (Overdue)');
html = html.replace(/Exceeded\s*24h\s*turnaround\s*window\s*under\s*Service\s*Level\s*Agreement\s*\(\s*SLA\s*\)\./gi, 'Pending past 24h turnaround window.');
html = html.replace(/⏱️\s*SLA\s*Escalation\s*Warning/gi, '⏱️ Pending Escalation Warning');
html = html.replace(/Water\s*leakage\s*in\s*Hostel\s*Block\s*exceeded\s*24h\s*SLA\./gi, 'Water leakage in Hostel Block is pending.');
html = html.replace(/<span class="text-xs font-bold text-emerald-600">SLA Active<\/span>/gi, '<span class="text-xs font-bold text-emerald-600">Active</span>');
html = html.replace(/notifications and SLA escalation logs/gi, 'notifications and pending escalation logs');

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully replaced Service Level Agreement / SLA with Pending!');
