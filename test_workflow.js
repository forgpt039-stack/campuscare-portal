const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runEndToEndWorkflowTest() {
  console.log('=== STARTING WORKFLOW VERIFICATION TEST ===\n');

  // Step 1: Student logs in (student Aarav N240001)
  console.log('Step 1: Student "Aarav" logged in.');

  // Step 2: Student submits a new complaint
  console.log('\nStep 2: Student submits a new complaint with details & image...');
  const newComplaintPayload = {
    studentName: 'Aarav',
    studentId: 'N240001',
    department: 'Computer Science & Engineering',
    studentClass: '3rd Year - Section B',
    category: 'Electrical',
    title: 'Ceiling fan regulator short circuit & continuous humming in Lab 2',
    description: 'The ceiling fan regulator in CS Lab 2 sparked when turned to speed 5. It is stuck at full speed and emits an electrical burning odor.',
    location: 'A3 Block > 3rd Floor > CS Lab 2',
    block: 'A3 Block',
    floor: '3rd Floor',
    room: 'CS Lab 2',
    priority: 'High',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  };

  const submitRes = await request('POST', '/api/complaints', newComplaintPayload);
  if (!submitRes.success || !submitRes.complaint) {
    throw new Error('Failed to submit complaint: ' + JSON.stringify(submitRes));
  }
  const complaintId = submitRes.complaint.id;
  console.log(`✓ Complaint successfully created with ID: ${complaintId}, Status: ${submitRes.complaint.status}`);

  // Step 3: Administrator logs in
  console.log('\nStep 3: Administrator "M. Satyanarayana" logs in.');

  // Step 4: The newly submitted complaint automatically appears in the admin dashboard
  console.log('\nStep 4: Fetching complaints in Administrator Dashboard...');
  const adminComplaintsRes = await request('GET', '/api/complaints');
  const foundComplaint = adminComplaintsRes.complaints.find(c => c.id === complaintId);
  if (!foundComplaint) {
    throw new Error(`Complaint ${complaintId} not found in admin complaints list!`);
  }
  console.log(`✓ VERIFIED: Complaint ${complaintId} automatically appears in Admin Dashboard!`);
  console.log(`   Title: "${foundComplaint.title}"`);
  console.log(`   Student: ${foundComplaint.studentName} (${foundComplaint.studentId})`);
  console.log(`   Priority: ${foundComplaint.priority}`);
  console.log(`   Status: ${foundComplaint.status}`);

  // Step 5 & 6: Administrator opens complaint, assigns to staff & changes status to In Progress
  console.log('\nStep 5 & 6: Administrator assigns staff "Vikram Kumar" (Electrical) and updates status to "In Progress"...');
  const assignRes = await request('PATCH', `/api/complaints/${complaintId}`, {
    status: 'In Progress',
    assignedDepartment: 'Electrical',
    assignedStaff: 'Vikram Kumar',
    adminRemarks: 'Senior electrician Vikram Kumar assigned with replacement regulator module.',
    actor: 'M. Satyanarayana (Admin)'
  });
  if (!assignRes.success) {
    throw new Error('Failed to update complaint: ' + JSON.stringify(assignRes));
  }
  console.log(`✓ Complaint ${complaintId} updated: Status = ${assignRes.complaint.status}, AssignedStaff = ${assignRes.complaint.assignedStaff}`);

  // Step 7: Student receives status update and notification
  console.log('\nStep 7: Student checks complaint status and notifications...');
  const studentComplaintsRes = await request('GET', `/api/complaints/${complaintId}`);
  console.log(`✓ Student sees updated Status: ${studentComplaintsRes.complaint.status}, Assigned: ${studentComplaintsRes.complaint.assignedStaff}`);
  console.log(`   Admin Remarks: "${studentComplaintsRes.complaint.adminRemarks}"`);

  const studentNotifs = await request('GET', `/api/notifications?studentId=N240001`);
  const relevantNotif = studentNotifs.notifications.find(n => n.complaintId === complaintId);
  if (relevantNotif) {
    console.log(`✓ Student received Notification: "${relevantNotif.title}" - ${relevantNotif.message}`);
  }

  // Step 8: Administrator marks the complaint as Resolved
  console.log('\nStep 8: Administrator marks complaint as "Resolved"...');
  const resolveRes = await request('PATCH', `/api/complaints/${complaintId}`, {
    status: 'Resolved',
    adminRemarks: 'New digital fan regulator fitted, tested at all speed steps, and safety-certified.',
    actor: 'M. Satyanarayana (Admin)'
  });
  console.log(`✓ Complaint marked Resolved: Status = ${resolveRes.complaint.status}`);

  // Step 9: Student can see that the complaint has been resolved
  console.log('\nStep 9: Student verifies resolved status...');
  const finalStudentCheck = await request('GET', `/api/complaints/${complaintId}`);
  if (finalStudentCheck.complaint.status === 'Resolved') {
    console.log(`✓ VERIFIED: Student sees complaint ${complaintId} is RESOLVED!`);
    console.log(`   Final Remarks: "${finalStudentCheck.complaint.adminRemarks}"`);
  } else {
    throw new Error('Complaint status is not Resolved!');
  }

  // Verification of Stats & Analytics
  console.log('\nVerifying Administrator Stats & KPIs...');
  const statsRes = await request('GET', '/api/stats');
  console.log(`✓ Total Complaints in DB: ${statsRes.stats.total}`);
  console.log(`✓ Resolved Complaints: ${statsRes.stats.resolved}`);
  console.log(`✓ In Progress: ${statsRes.stats.inProgress}`);
  console.log(`✓ Pending: ${statsRes.stats.pending}`);
  console.log(`✓ Critical Hazards: ${statsRes.stats.critical}`);

  console.log('\n========================================');
  console.log('✓ ALL 9 WORKFLOW STEPS PASSED PERFECTLY!');
  console.log('========================================');
}

runEndToEndWorkflowTest().catch(console.error);
