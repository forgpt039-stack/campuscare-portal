const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database Helper
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { complaints: [], staff: [], students: [], notifications: [] };
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { complaints: [], staff: [], students: [], notifications: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// Parse Request Body Helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Safeguard max 50MB for video/image uploads
      if (body.length > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

// Send JSON Helper
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Priority weight for sorting
const PRIORITY_WEIGHT = {
  'Critical': 4,
  'High': 3,
  'Medium': 2,
  'Low': 1
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ----------------------------------------------------------------
  // REST API ROUTER
  // ----------------------------------------------------------------

  // 1. GET /api/complaints
  if (method === 'GET' && pathname === '/api/complaints') {
    const db = readDB();
    let list = [...(db.complaints || [])];

    const { search, category, department, location, status, priority, studentId, sort } = parsedUrl.query;

    if (studentId) {
      list = list.filter(c => c.studentId === studentId);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(c =>
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.studentId && c.studentId.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      list = list.filter(c => c.category === category);
    }

    if (department && department !== 'All') {
      list = list.filter(c => c.department === department || c.assignedDepartment === department);
    }

    if (location && location !== 'All') {
      list = list.filter(c => c.location && c.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (status && status !== 'All') {
      list = list.filter(c => c.status === status);
    }

    if (priority && priority !== 'All') {
      list = list.filter(c => c.priority === priority);
    }

    // Sort
    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else if (sort === 'priority') {
      list.sort((a, b) => {
        const pDiff = (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
    } else {
      // Default: newest first
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    sendJSON(res, 200, { success: true, count: list.length, complaints: list });
    return;
  }

  // 2. GET /api/complaints/:id
  if (method === 'GET' && pathname.startsWith('/api/complaints/')) {
    const id = pathname.replace('/api/complaints/', '').trim();
    const db = readDB();
    const complaint = (db.complaints || []).find(c => c.id === id);

    if (!complaint) {
      sendJSON(res, 404, { success: false, message: 'Complaint not found' });
      return;
    }

    sendJSON(res, 200, { success: true, complaint });
    return;
  }

  // 3. POST /api/complaints - Student submits complaint
  if (method === 'POST' && pathname === '/api/complaints') {
    try {
      const body = await parseBody(req);
      const db = readDB();

      if (!body.title || !body.category) {
        sendJSON(res, 400, { success: false, message: 'Title and category are required' });
        return;
      }

      // Generate unique ID: CMP-2026-XXX
      let newId;
      do {
        newId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
      } while ((db.complaints || []).some(c => c.id === newId));

      const now = new Date().toISOString();

      const newComplaint = {
        id: newId,
        studentName: body.studentName || 'Aarav',
        studentId: body.studentId || 'N240001',
        department: body.department || 'Computer Science & Engineering',
        studentClass: body.studentClass || '3rd Year - Section B',
        category: body.category,
        title: body.title,
        description: body.description || body.title,
        location: body.location || `${body.block || 'A3 Block'} > ${body.floor || '2nd Floor'} > ${body.room || 'Room 204'}`,
        block: body.block || 'Academic Block',
        floor: body.floor || '1st Floor',
        room: body.room || 'Room 101',
        priority: body.priority || 'Medium',
        status: 'Pending',
        mediaType: body.mediaType || (body.mediaUrl ? 'image' : null),
        mediaUrl: body.mediaUrl || '',
        submittedAt: now,
        assignedDepartment: null,
        assignedStaff: null,
        assignedStaffPhone: null,
        adminRemarks: '',
        upvotes: 0,
        timeline: [
          {
            time: now,
            action: 'Complaint Submitted',
            actor: `${body.studentName || 'Aarav'} (Student)`,
            note: 'Complaint received and queued in administrative dashboard.'
          }
        ]
      };

      db.complaints = db.complaints || [];
      db.complaints.unshift(newComplaint);

      // Create Admin Notification
      db.notifications = db.notifications || [];
      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        targetRole: 'admin',
        studentId: newComplaint.studentId,
        complaintId: newComplaint.id,
        title: newComplaint.priority === 'Critical' ? '🚨 Critical Hazard Reported' : 'New Student Complaint',
        message: `${newComplaint.studentName} (${newComplaint.studentId}) filed: "${newComplaint.title}" [${newComplaint.category}]`,
        timestamp: now,
        read: false,
        type: newComplaint.priority === 'Critical' ? 'critical_alert' : 'new_complaint'
      });

      // Update student total complaints count
      const student = (db.students || []).find(s => s.id === newComplaint.studentId);
      if (student) {
        student.totalComplaints = (student.totalComplaints || 0) + 1;
        student.activeComplaints = (student.activeComplaints || 0) + 1;
      }

      writeDB(db);
      sendJSON(res, 201, { success: true, message: 'Complaint submitted successfully', complaint: newComplaint });
      return;
    } catch (e) {
      sendJSON(res, 500, { success: false, message: e.message });
      return;
    }
  }

  // 4. PATCH /api/complaints/:id - Admin updates status / assigns staff / adds remarks
  if (method === 'PATCH' && pathname.startsWith('/api/complaints/')) {
    try {
      const id = pathname.replace('/api/complaints/', '').trim();
      const body = await parseBody(req);
      const db = readDB();

      const complaintIndex = (db.complaints || []).findIndex(c => c.id === id);
      if (complaintIndex === -1) {
        sendJSON(res, 404, { success: false, message: 'Complaint not found' });
        return;
      }

      const complaint = db.complaints[complaintIndex];
      const now = new Date().toISOString();
      const previousStatus = complaint.status;
      const previousStaff = complaint.assignedStaff;

      // Update fields
      if (body.status && ['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(body.status)) {
        complaint.status = body.status;
      }
      if (body.priority && ['Low', 'Medium', 'High', 'Critical'].includes(body.priority)) {
        complaint.priority = body.priority;
      }
      if (body.assignedDepartment !== undefined) {
        complaint.assignedDepartment = body.assignedDepartment;
      }
      if (body.assignedStaff !== undefined) {
        complaint.assignedStaff = body.assignedStaff;
        // Lookup phone if staff name is in staff directory
        const staffMember = (db.staff || []).find(s => s.name === body.assignedStaff);
        if (staffMember) {
          complaint.assignedStaffPhone = staffMember.phone;
        }
      }
      if (body.assignedStaffPhone !== undefined) {
        complaint.assignedStaffPhone = body.assignedStaffPhone;
      }
      if (body.adminRemarks !== undefined) {
        complaint.adminRemarks = body.adminRemarks;
      }

      complaint.timeline = complaint.timeline || [];

      // Record timeline event
      if (body.status && body.status !== previousStatus) {
        complaint.timeline.push({
          time: now,
          action: `Status Changed to ${body.status}`,
          actor: body.actor || 'Administrator',
          note: body.adminRemarks || `Status marked as ${body.status}.`
        });
      } else if (body.assignedStaff && body.assignedStaff !== previousStaff) {
        complaint.timeline.push({
          time: now,
          action: `Assigned to ${body.assignedStaff}`,
          actor: body.actor || 'Administrator',
          note: `Department: ${body.assignedDepartment || complaint.assignedDepartment || 'Maintenance'}`
        });
      } else if (body.adminRemarks) {
        complaint.timeline.push({
          time: now,
          action: 'Administrative Remarks Added',
          actor: body.actor || 'Administrator',
          note: body.adminRemarks
        });
      }

      // Create Student Notification
      db.notifications = db.notifications || [];
      let notifTitle = `Complaint Update: ${complaint.id}`;
      let notifMsg = `Your complaint "${complaint.title}" status is now ${complaint.status}.`;
      if (body.assignedStaff && body.assignedStaff !== previousStaff) {
        notifTitle = `🛠️ Staff Assigned: ${complaint.id}`;
        notifMsg = `Assigned to ${body.assignedStaff} (${complaint.assignedDepartment || 'Maintenance'}).`;
      } else if (body.status === 'Resolved') {
        notifTitle = `✅ Issue Resolved: ${complaint.id}`;
        notifMsg = `Your complaint "${complaint.title}" has been marked as Resolved.`;
      } else if (body.status === 'Rejected') {
        notifTitle = `❌ Complaint Update: ${complaint.id}`;
        notifMsg = `Your complaint "${complaint.title}" has been reviewed and rejected. Remarks: ${complaint.adminRemarks || 'N/A'}`;
      }

      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        targetRole: 'student',
        studentId: complaint.studentId,
        complaintId: complaint.id,
        title: notifTitle,
        message: notifMsg,
        timestamp: now,
        read: false,
        type: body.status === 'Resolved' ? 'resolved' : 'status_change'
      });

      writeDB(db);
      sendJSON(res, 200, { success: true, message: 'Complaint updated successfully', complaint });
      return;
    } catch (e) {
      sendJSON(res, 500, { success: false, message: e.message });
      return;
    }
  }

  // 5. GET /api/stats - Dashboard analytics and metric counters
  if (method === 'GET' && pathname === '/api/stats') {
    const db = readDB();
    const complaints = db.complaints || [];

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      rejected: complaints.filter(c => c.status === 'Rejected').length,
      critical: complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Rejected').length,
      byCategory: {},
      byStatus: {},
      byDepartment: {},
      byPriority: {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0
      },
      monthlyTrends: [
        { month: 'Jun', complaints: 14, resolved: 12 },
        { month: 'Jul', complaints: 19, resolved: 18 },
        { month: 'Aug', complaints: 28, resolved: 25 },
        { month: 'Sep', complaints: 34, resolved: 31 },
        { month: 'Oct', complaints: 42, resolved: 38 },
        { month: 'Nov', complaints: complaints.length, resolved: complaints.filter(c => c.status === 'Resolved').length }
      ],
      recent: complaints.slice(0, 5)
    };

    complaints.forEach(c => {
      // By category
      stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
      // By status
      stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
      // By department
      const dept = c.department || 'General';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
      // By priority
      if (stats.byPriority[c.priority] !== undefined) {
        stats.byPriority[c.priority]++;
      }
    });

    sendJSON(res, 200, { success: true, stats });
    return;
  }

  // 6. GET /api/notifications
  if (method === 'GET' && pathname === '/api/notifications') {
    const db = readDB();
    let notifs = [...(db.notifications || [])];
    const { role, studentId } = parsedUrl.query;

    if (role === 'admin') {
      notifs = notifs.filter(n => n.targetRole === 'admin');
    } else if (studentId) {
      notifs = notifs.filter(n => n.targetRole === 'student' && n.studentId === studentId);
    }

    notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const unreadCount = notifs.filter(n => !n.read).length;

    sendJSON(res, 200, { success: true, count: notifs.length, unreadCount, notifications: notifs });
    return;
  }

  // 7. PATCH /api/notifications/:id/read
  if (method === 'PATCH' && pathname.includes('/read')) {
    const db = readDB();
    const id = pathname.replace('/api/notifications/', '').replace('/read', '').trim();
    const notif = (db.notifications || []).find(n => n.id === id);
    if (notif) {
      notif.read = true;
      writeDB(db);
    }
    sendJSON(res, 200, { success: true });
    return;
  }

  // 8. POST /api/notifications/mark-all-read
  if (method === 'POST' && pathname === '/api/notifications/mark-all-read') {
    const db = readDB();
    const { role, studentId } = parsedUrl.query;
    (db.notifications || []).forEach(n => {
      if (role === 'admin' && n.targetRole === 'admin') {
        n.read = true;
      } else if (studentId && n.targetRole === 'student' && n.studentId === studentId) {
        n.read = true;
      }
    });
    writeDB(db);
    sendJSON(res, 200, { success: true });
    return;
  }

  // 9. GET /api/staff - Maintenance Staff Directory
  if (method === 'GET' && pathname === '/api/staff') {
    const db = readDB();
    const complaints = db.complaints || [];

    const staffList = (db.staff || []).map(s => {
      const activeCount = complaints.filter(c =>
        c.assignedStaff === s.name &&
        c.status !== 'Resolved' &&
        c.status !== 'Rejected'
      ).length;
      return {
        ...s,
        activeComplaints: activeCount,
        status: activeCount > 2 ? 'Busy' : 'Available'
      };
    });

    sendJSON(res, 200, { success: true, count: staffList.length, staff: staffList });
    return;
  }

  // 10. GET /api/students - Registered Students Directory
  if (method === 'GET' && pathname === '/api/students') {
    const db = readDB();
    const complaints = db.complaints || [];

    const studentList = (db.students || []).map(s => {
      const studentComplaints = complaints.filter(c => c.studentId === s.id);
      const activeCount = studentComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
      return {
        ...s,
        totalComplaints: studentComplaints.length,
        activeComplaints: activeCount
      };
    });

    sendJSON(res, 200, { success: true, count: studentList.length, students: studentList });
    return;
  }

  // 11. POST /api/upload - Handle Photo / Video Upload
  if (method === 'POST' && pathname === '/api/upload') {
    try {
      const body = await parseBody(req);
      if (!body.data) {
        sendJSON(res, 400, { success: false, message: 'File data required' });
        return;
      }

      // Check if data is base64 string
      const matches = body.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer;
      let ext = '.jpg';
      let isVideo = false;

      if (matches && matches.length === 3) {
        const mime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
        if (mime.includes('video') || mime.includes('mp4')) {
          ext = '.mp4';
          isVideo = true;
        } else if (mime.includes('png')) {
          ext = '.png';
        } else if (mime.includes('gif')) {
          ext = '.gif';
        } else {
          ext = '.jpg';
        }
      } else {
        buffer = Buffer.from(body.data, 'base64');
      }

      const fileName = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${fileName}`;
      sendJSON(res, 201, {
        success: true,
        url: fileUrl,
        mediaType: isVideo ? 'video' : 'image',
        fileName
      });
      return;
    } catch (e) {
      sendJSON(res, 500, { success: false, message: e.message });
      return;
    }
  }

  // ----------------------------------------------------------------
  // STATIC FILE HANDLER
  // ----------------------------------------------------------------
  let reqPath = parsedUrl.pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath;
  if (reqPath.startsWith('/uploads/')) {
    filePath = path.join(__dirname, 'public', reqPath);
  } else {
    filePath = path.join(__dirname, reqPath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing if not found
      if (!path.extname(reqPath)) {
        filePath = path.join(__dirname, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 CampusCare Portal & REST Backend running at:`);
  console.log(`   > Local:   http://localhost:${PORT}/`);
  console.log(`   > Network: http://127.0.0.1:${PORT}/`);
  console.log(`   > API:     http://localhost:${PORT}/api/complaints\n`);
});
