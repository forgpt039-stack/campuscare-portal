const fs = require('fs');

const controllerCode = `
  <script>
    // --- 1. DARK MODE THEME MANAGEMENT ---
    function initTheme() {
      const savedTheme = localStorage.getItem('campuscare_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = '☀️';
      } else {
        document.documentElement.classList.remove('dark');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = '🌙';
      }
    }
    initTheme();

    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('campuscare_theme', isDark ? 'dark' : 'light');
      const icon = document.getElementById('theme-icon');
      if (icon) icon.innerText = isDark ? '☀️' : '🌙';
      showToast(isDark ? 'Dark Mode activated 🌙' : 'Light Mode activated ☀️');
    }

    // --- 2. GLOBAL STATE & USER PROFILES ---
    const demoUsers = {
      student: {
        roleType: "student",
        name: "Aarav",
        role: "Student (CSE) • 3rd Year",
        id: "aarav@rgukt.ac.in",
        studentId: "N240001",
        department: "Computer Science & Engineering",
        class: "3rd Year - Section B",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&h=240&q=80"
      },
      faculty: {
        roleType: "faculty",
        name: "Dr. Rajesh Sharma",
        role: "Faculty Advisor (CSE Dept)",
        id: "FAC-CSE-104@rguktn.ac.in",
        studentId: "FAC-104",
        department: "Computer Science & Engineering",
        class: "Advisor A3-302",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80"
      },
      admin: {
        roleType: "admin",
        name: "M. Satyanarayana",
        role: "Campus Administration",
        id: "ADMIN@rguktn.ac.in",
        studentId: "ADM-001",
        department: "Estate & Campus Facilities",
        class: "Chief Warden",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80"
      }
    };

    let activeUser = demoUsers.student;
    let backendComplaints = [];
    let backendStats = null;
    let backendStaff = [];
    let backendStudents = [];
    let backendNotifications = [];
    let selectedModalComplaint = null;

    let capturedPhotoData = "";
    let capturedMediaType = "image";
    let mediaStreamInstance = null;
    let currentCameraFacing = "environment";
    let toastTimer = null;
    let currentStudentFilter = 'All';

    // --- 3. BACKEND API CLIENT ---
    async function apiFetch(endpoint, options = {}) {
      try {
        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          ...options
        });
        return await res.json();
      } catch (err) {
        console.warn('API fetch warning:', endpoint, err.message);
        return { success: false, message: err.message };
      }
    }

    async function syncComplaintsFromBackend(showSyncToast = false) {
      try {
        const [compRes, statRes, staffRes, studRes, notifRes] = await Promise.all([
          apiFetch('/api/complaints'),
          apiFetch('/api/stats'),
          apiFetch('/api/staff'),
          apiFetch('/api/students'),
          apiFetch('/api/notifications?role=' + (activeUser.roleType === 'admin' ? 'admin' : '') + '&studentId=' + (activeUser.studentId || 'N240001'))
        ]);

        if (compRes && compRes.success) {
          backendComplaints = compRes.complaints || [];
        }
        if (statRes && statRes.success) {
          backendStats = statRes.stats || null;
        }
        if (staffRes && staffRes.success) {
          backendStaff = staffRes.staff || [];
        }
        if (studRes && studRes.success) {
          backendStudents = studRes.students || [];
        }
        if (notifRes && notifRes.success) {
          backendNotifications = notifRes.notifications || [];
        }

        // Render appropriate views based on role
        if (activeUser.roleType === 'admin') {
          renderAdminDashboard();
        } else {
          renderStudentDashboard();
        }

        if (showSyncToast) {
          showToast('✓ Live data synchronized with database');
        }
      } catch (err) {
        console.error('Data sync failed:', err);
      }
    }

    // Auto-sync polling every 3.5s to keep both Student and Admin in sync in real time
    setInterval(() => {
      const auth = document.getElementById('auth-screen');
      if (!auth || auth.style.display === 'none') {
        syncComplaintsFromBackend(false);
      }
    }, 3500);

    // --- 4. AUTHENTICATION & ROLE SWITCHING ---
    function toggleAuthTab(type) {
      const tabId = document.getElementById('tab-auth-id');
      const tabOtp = document.getElementById('tab-auth-otp');
      const formId = document.getElementById('form-auth-id');
      const formOtp = document.getElementById('form-auth-otp');

      if (type === 'id') {
        tabId.className = "flex-1 pb-2.5 border-b-2 border-brand-600 text-brand-600 text-center transition font-bold";
        tabOtp.className = "flex-1 pb-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-700 text-center transition";
        formId.classList.remove('hidden');
        formOtp.classList.add('hidden');
      } else {
        tabOtp.className = "flex-1 pb-2.5 border-b-2 border-brand-600 text-brand-600 text-center transition font-bold";
        tabId.className = "flex-1 pb-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-700 text-center transition";
        formOtp.classList.remove('hidden');
        formId.classList.add('hidden');
      }
    }

    function loginWithRole(role) {
      document.querySelectorAll('[id^="btn-role-"]').forEach(btn => {
        btn.classList.remove('border-brand-500', 'bg-blue-50/60');
        btn.classList.add('border-slate-200');
      });

      const selBtn = document.getElementById('btn-role-' + role);
      if (selBtn) {
        selBtn.classList.remove('border-slate-200');
        selBtn.classList.add('border-brand-500', 'bg-blue-50/60');
      }

      activeUser = demoUsers[role] || demoUsers.student;
      localStorage.setItem('campuscare_active_user', role);

      const idInput = document.getElementById('auth-input-id');
      const pwdInput = document.getElementById('auth-input-pwd');
      if (idInput) idInput.value = activeUser.id;
      if (pwdInput) pwdInput.value = 'CampusCare#2026';

      executeSuccessfulLogin();
    }

    function togglePasswordVisibility() {
      const pwd = document.getElementById('auth-input-pwd');
      if (pwd) {
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
      }
    }

    function evalPwdStrength(val) {
      const bar = document.getElementById('pwd-strength-bar');
      const txt = document.getElementById('pwd-strength-text');
      if (!bar || !txt) return;
      if (val.length < 5) {
        bar.className = "h-full bg-rose-500 w-1/4 transition-all";
        txt.className = "text-[10px] font-bold text-rose-500";
        txt.innerText = "Weak";
      } else if (val.length < 8) {
        bar.className = "h-full bg-amber-500 w-2/4 transition-all";
        txt.className = "text-[10px] font-bold text-amber-500";
        txt.innerText = "Fair";
      } else {
        bar.className = "h-full bg-emerald-500 w-full transition-all";
        txt.className = "text-[10px] font-bold text-emerald-600";
        txt.innerText = "Secure";
      }
    }

    function launchOtpVerification(e) {
      if (e) e.preventDefault();
      const phone = document.getElementById('auth-input-phone')?.value || "+91 98765 43210";
      const displayPhone = document.getElementById('display-otp-num');
      if (displayPhone) displayPhone.innerText = phone;
      const modal = document.getElementById('otp-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function confirmOtpLogin() {
      const modal = document.getElementById('otp-modal');
      if (modal) modal.classList.add('hidden');
      executeSuccessfulLogin();
    }

    function handleAuthLogin(e) {
      if (e) e.preventDefault();
      const id = (document.getElementById('auth-input-id')?.value || '').toLowerCase().trim();
      if (id.includes('admin')) {
        activeUser = demoUsers.admin;
      } else if (id.includes('fac') || id.includes('sharma')) {
        activeUser = demoUsers.faculty;
      } else {
        activeUser = demoUsers.student;
      }
      executeSuccessfulLogin();
    }

    function executeSuccessfulLogin() {
      const auth = document.getElementById('auth-screen');
      if (auth) {
        auth.style.opacity = '0';
        auth.style.pointerEvents = 'none';
        setTimeout(() => {
          auth.style.display = 'none';
        }, 250);
      }

      const studentView = document.getElementById('student-app-view');
      const adminView = document.getElementById('admin-app-view');

      if (activeUser.roleType === 'admin') {
        if (studentView) studentView.classList.add('hidden');
        if (adminView) adminView.classList.remove('hidden');
        switchAdminNav('overview');
        showToast('✓ Welcome, Administrator ' + activeUser.name);
      } else {
        if (adminView) adminView.classList.add('hidden');
        if (studentView) studentView.classList.remove('hidden');
        applyStudentUserData();
        showToast('✓ Signed in as ' + activeUser.name);
      }

      syncComplaintsFromBackend(false);
    }

    function triggerLogout() {
      const auth = document.getElementById('auth-screen');
      if (auth) {
        auth.style.display = 'flex';
        setTimeout(() => {
          auth.style.opacity = '1';
          auth.style.pointerEvents = 'auto';
        }, 10);
      }
      const studentView = document.getElementById('student-app-view');
      const adminView = document.getElementById('admin-app-view');
      if (studentView) studentView.classList.remove('hidden');
      if (adminView) adminView.classList.add('hidden');
      toggleSideDrawer(false);
      showToast('Logged out securely');
    }

    function applyStudentUserData() {
      const setAttr = (id, attr, val) => {
        const el = document.getElementById(id);
        if (el) el[attr] = val;
      };
      const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
      };

      setAttr('top-avatar', 'src', activeUser.avatar);
      setAttr('drawer-user-avatar', 'src', activeUser.avatar);
      setText('drawer-user-name', activeUser.name);
      setText('drawer-user-role', activeUser.role);
      setText('drawer-user-id', activeUser.studentId ? ('Roll: ' + activeUser.studentId + ' • RGUKT Nuzvid') : activeUser.id);
      setAttr('profile-card-avatar', 'src', activeUser.avatar);
      setText('profile-card-name', activeUser.name);
      setText('profile-card-role', activeUser.role);
      setText('profile-card-id', activeUser.id);
    }

    // --- 5. STUDENT DASHBOARD & GRIEVANCE FILING ---
    function openDedicatedScreen(screenId) {
      document.querySelectorAll('.fixed.inset-0.z-40').forEach(s => s.classList.add('hidden'));
      const screen = document.getElementById('screen-' + screenId);
      if (screen) screen.classList.remove('hidden');

      if (screenId === 'report') {
        const deptInput = document.getElementById('report-input-dept');
        const classInput = document.getElementById('report-input-class');
        if (deptInput && !deptInput.value) deptInput.value = activeUser.department || "Computer Science & Engineering";
        if (classInput && !classInput.value) classInput.value = activeUser.class || "3rd Year - Section B";
      } else if (screenId === 'in-progress') {
        renderInProgressScreen();
      } else if (screenId === 'pending') {
        renderPendingScreen();
      } else if (screenId === 'resolved') {
        renderResolvedScreen();
      }
    }

    function closeAllDedicatedScreens() {
      document.querySelectorAll('.fixed.inset-0.z-40').forEach(s => s.classList.add('hidden'));
      closeCameraStream();
    }

    function launchReportWithCategory(category) {
      openDedicatedScreen('report');
      const catSelect = document.getElementById('report-input-category');
      if (catSelect) {
        for (let i = 0; i < catSelect.options.length; i++) {
          if (catSelect.options[i].value.toLowerCase().includes(category.toLowerCase())) {
            catSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    function checkDuplicate(val) {
      const warning = document.getElementById('dup-warning');
      if (!warning) return;
      if (!val || val.length < 4) {
        warning.classList.add('hidden');
        return;
      }
      const q = val.toLowerCase();
      const match = backendComplaints.find(c =>
        c.status !== 'Resolved' &&
        c.status !== 'Rejected' &&
        (c.title.toLowerCase().includes(q) || q.includes(c.title.toLowerCase()))
      );
      if (match) {
        warning.classList.remove('hidden');
      } else {
        warning.classList.add('hidden');
      }
    }

    function upvoteExistingTicket() {
      showToast('✓ +1 Upvote recorded for matching issue!');
      closeAllDedicatedScreens();
    }

    // Camera Capture & Media Upload
    async function startCameraStream() {
      const box = document.getElementById('camera-box');
      const video = document.getElementById('camera-stream');
      if (!box || !video) return;
      box.classList.remove('hidden');
      try {
        if (mediaStreamInstance) {
          mediaStreamInstance.getTracks().forEach(t => t.stop());
        }
        mediaStreamInstance = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: currentCameraFacing }
        });
        video.srcObject = mediaStreamInstance;
      } catch (err) {
        console.warn('Camera stream error:', err);
        showToast('Camera not available, please use file upload');
      }
    }

    function flipCameraLens() {
      currentCameraFacing = currentCameraFacing === 'user' ? 'environment' : 'user';
      startCameraStream();
    }

    function closeCameraStream() {
      if (mediaStreamInstance) {
        mediaStreamInstance.getTracks().forEach(t => t.stop());
        mediaStreamInstance = null;
      }
      const box = document.getElementById('camera-box');
      if (box) box.classList.add('hidden');
    }

    function captureLiveSnapshot() {
      const video = document.getElementById('camera-stream');
      const canvas = document.getElementById('snapshot-canvas');
      const previewBox = document.getElementById('snapshot-preview-box');
      const previewImg = document.getElementById('snapshot-img');
      if (!video || !canvas || !previewBox || !previewImg) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      capturedPhotoData = canvas.toDataURL('image/jpeg', 0.85);
      capturedMediaType = 'image';
      previewImg.src = capturedPhotoData;
      previewBox.classList.remove('hidden');
      closeCameraStream();
      showToast('Photo evidence captured!');
    }

    function retakeSnapshot() {
      capturedPhotoData = "";
      const previewBox = document.getElementById('snapshot-preview-box');
      if (previewBox) previewBox.classList.add('hidden');
      startCameraStream();
    }

    function handleFilePhotoUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        capturedPhotoData = evt.target.result;
        capturedMediaType = file.type.includes('video') ? 'video' : 'image';
        const previewBox = document.getElementById('snapshot-preview-box');
        const previewImg = document.getElementById('snapshot-img');
        if (previewBox && previewImg) {
          previewImg.src = capturedPhotoData;
          previewBox.classList.remove('hidden');
        }
        showToast(capturedMediaType === 'video' ? 'Video attached' : 'Photo attached');
      };
      reader.readAsDataURL(file);
    }

    // Submit Grievance Ticket
    async function handleNewTicketSubmit(e) {
      if (e) e.preventDefault();
      const submitBtn = e?.target?.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Dispatching to Campus Maintenance...";
      }

      const title = document.getElementById('report-input-title')?.value || "Campus Issue";
      const category = document.getElementById('report-input-category')?.value || "Maintenance";
      const desc = document.getElementById('report-input-desc')?.value || title;
      const block = document.getElementById('report-input-block')?.value || "A3 Academic Block";
      const floor = document.getElementById('report-input-floor')?.value || "2nd Floor";
      const room = document.getElementById('report-input-room')?.value || "Room 204";
      const priorityRadio = document.querySelector('input[name="priority"]:checked');
      const priority = priorityRadio ? priorityRadio.value : "Medium";
      const dept = document.getElementById('report-input-dept')?.value || activeUser.department || "Computer Science & Engineering";
      const studentClass = document.getElementById('report-input-class')?.value || activeUser.class || "3rd Year - Section B";

      const payload = {
        studentName: activeUser.name,
        studentId: activeUser.studentId || "N240001",
        department: dept,
        studentClass: studentClass,
        category: category,
        title: title,
        description: desc,
        location: block + " > " + floor + " > " + room,
        block: block,
        floor: floor,
        room: room,
        priority: priority === 'SOS' ? 'Critical' : priority,
        mediaType: capturedMediaType,
        mediaUrl: capturedPhotoData || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
      };

      const res = await apiFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Dispatch Work Order Ticket";
      }

      if (res && res.success) {
        capturedPhotoData = "";
        capturedMediaType = "image";
        const previewBox = document.getElementById('snapshot-preview-box');
        if (previewBox) previewBox.classList.add('hidden');
        const form = e?.target;
        if (form && form.reset) form.reset();

        closeAllDedicatedScreens();
        showToast('✓ Complaint registered! ID: ' + res.complaint.id);
        syncComplaintsFromBackend(false);
      } else {
        showToast('Error filing complaint: ' + (res.message || 'Unknown'));
      }
    }

    // Render Student View Cards & Feeds
    function renderStudentDashboard() {
      const studentComplaints = backendComplaints;
      const myComplaints = studentComplaints.filter(c => c.studentId === (activeUser.studentId || "N240001"));

      const inProg = myComplaints.filter(c => c.status === 'In Progress').length;
      const pending = myComplaints.filter(c => c.status === 'Pending').length;
      const resolved = myComplaints.filter(c => c.status === 'Resolved').length;

      const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
      };

      setText('stat-count-inprog', inProg + ' Active');
      setText('stat-count-pending', pending + ' Alert');
      setText('stat-count-resolved', resolved + ' Done');

      setText('count-pill-all', myComplaints.length);
      setText('count-pill-pending', pending);
      setText('count-pill-inprog', inProg);
      setText('count-pill-resolved', resolved);

      setText('drawer-inprog-count', inProg);
      setText('drawer-pending-count', pending);
      setText('drawer-resolved-count', resolved);

      // Render Home Feeds
      filterLiveTickets(currentStudentFilter);

      // Render Dedicated Screens
      renderInProgressScreen();
      renderPendingScreen();
      renderResolvedScreen();

      // Render Notifications Dropdown
      renderStudentNotifications();
    }

    function renderComplaintsCardList(list) {
      if (list.length === 0) {
        return '<div class="p-8 text-center text-xs text-slate-400">No complaints found.</div>';
      }
      return list.map(c => {
        const statusColor = c.status === 'Resolved' ? 'emerald' : c.status === 'In Progress' ? 'blue' : c.status === 'Rejected' ? 'rose' : 'amber';
        const priorityBadge = c.priority === 'Critical' ? '<span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">🚨 CRITICAL</span>' : '';
        return \`
          <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-brand-600 dark:text-brand-400">\${c.id}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-\${statusColor}-50 text-\${statusColor}-700 dark:bg-\${statusColor}-950 dark:text-\${statusColor}-300">\${c.status}</span>
                \${priorityBadge}
              </div>
              <span class="text-[10px] text-slate-400">\${formatDate(c.submittedAt)}</span>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white">\${escapeHtml(c.title)}</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <span>📍</span><span>\${escapeHtml(c.location)}</span>
              </p>
            </div>
            \${c.assignedStaff ? \`
              <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between text-[11px]">
                <span class="text-slate-600 dark:text-slate-300 font-medium">🛠️ Technician: <b>\${escapeHtml(c.assignedStaff)}</b></span>
                \${c.assignedStaffPhone ? \`<a href="tel:\${c.assignedStaffPhone}" class="text-brand-600 font-bold">Call</a>\` : ''}
              </div>
            \` : ''}
            \${c.adminRemarks ? \`
              <div class="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 text-[11px] text-amber-900 dark:text-amber-200 border border-amber-200/60">
                <span class="font-bold">Admin Remarks:</span> \${escapeHtml(c.adminRemarks)}
              </div>
            \` : ''}
          </div>
        \`;
      }).join('');
    }

    function filterLiveTickets(status) {
      currentStudentFilter = status;
      ['all', 'inprog', 'pending', 'resolved'].forEach(pillId => {
        const el = document.getElementById('filter-pill-' + pillId);
        if (!el) return;
        el.className = "px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap bg-slate-100 text-slate-600";
      });
      const activePillId = status === 'All' ? 'all' : status === 'In Progress' ? 'inprog' : status === 'Pending' ? 'pending' : 'resolved';
      const activeEl = document.getElementById('filter-pill-' + activePillId);
      if (activeEl) {
        activeEl.className = "px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap bg-brand-600 text-white shadow-xs";
      }

      const feed = document.getElementById('feed-tickets-container');
      if (!feed) return;
      const filtered = status === 'All' ? backendComplaints : backendComplaints.filter(c => c.status === status);
      feed.innerHTML = renderComplaintsCardList(filtered);
    }

    function renderInProgressScreen() {
      const container = document.getElementById('in-progress-container');
      if (!container) return;
      const inProg = backendComplaints.filter(c => c.status === 'In Progress');
      if (inProg.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">No work orders currently in progress.</div>';
        return;
      }
      container.innerHTML = inProg.map(c => \`
        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-700">Work Order #\${c.id}</span>
              <h3 class="text-base font-bold text-slate-900 mt-1">\${escapeHtml(c.title)}</h3>
              <p class="text-xs text-slate-500">📍 \${escapeHtml(c.location)}</p>
            </div>
            <span class="text-xs font-bold text-brand-600 bg-blue-50 px-2.5 py-1 rounded-xl">ETA: On-site</span>
          </div>

          <div class="py-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Milestone Stepper</span>
            <div class="grid grid-cols-4 gap-1 text-center">
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-brand-600 text-white">✓</div>
                <span class="text-[9px] mt-1 font-bold text-brand-600">Reported</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-brand-600 text-white">✓</div>
                <span class="text-[9px] mt-1 font-bold text-brand-600">Triage</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-brand-600 text-white">✓</div>
                <span class="text-[9px] mt-1 font-bold text-brand-600">Assigned</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white animate-pulse">⚙️</div>
                <span class="text-[9px] mt-1 font-bold text-amber-600">Repairing</span>
              </div>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div>
              <span class="text-[10px] font-bold text-slate-400 block uppercase">Assigned Technician</span>
              <span class="font-bold text-slate-800">\${escapeHtml(c.assignedStaff || 'Vikram Kumar (Electrical)')}</span>
            </div>
            \${c.assignedStaffPhone ? \`<a href="tel:\${c.assignedStaffPhone}" class="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"><span>📞</span><span>Call</span></a>\` : ''}
          </div>

          \${c.adminRemarks ? \`
            <div class="p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
              <span class="font-bold">Administrative Remarks:</span> \${escapeHtml(c.adminRemarks)}
            </div>
          \` : ''}

          <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button onclick="markAsResolved('\${c.id}')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs">
              ✓ Mark as Resolved & Sign Off
            </button>
          </div>
        </div>
      \`).join('');
    }

    function renderPendingScreen() {
      const container = document.getElementById('pending-container');
      if (!container) return;
      const pending = backendComplaints.filter(c => c.status === 'Pending');
      if (pending.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">No complaints currently pending. All work orders assigned!</div>';
        return;
      }
      container.innerHTML = pending.map(c => \`
        <div class="bg-white border border-rose-300 rounded-3xl p-5 shadow-sm space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Complaint #\${c.id}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full \${c.priority === 'Critical' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-100 text-amber-800'}">\${c.priority} Priority</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 mt-1">\${escapeHtml(c.title)}</h3>
              <p class="text-xs text-slate-500">📍 \${escapeHtml(c.location)}</p>
            </div>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">Pending Triage</span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            \${escapeHtml(c.description || c.title)}
          </div>

          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span class="text-slate-400">Submitted: \${formatDate(c.submittedAt)}</span>
            <button onclick="upvoteTicket('\${c.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition">
              +1 Upvote Issue (\${c.upvotes || 0})
            </button>
          </div>
        </div>
      \`).join('');
    }

    function renderResolvedScreen() {
      const container = document.getElementById('resolved-container');
      if (!container) return;
      const resolved = backendComplaints.filter(c => c.status === 'Resolved');
      if (resolved.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">No resolved complaints yet.</div>';
        return;
      }
      container.innerHTML = resolved.map(c => \`
        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Completed & Verified #\${c.id}</span>
              <h3 class="text-base font-bold text-slate-900 mt-1">\${escapeHtml(c.title)}</h3>
              <p class="text-xs text-slate-500">📍 \${escapeHtml(c.location)}</p>
            </div>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">✓ Signed Off</span>
          </div>

          <div class="p-3 rounded-2xl bg-emerald-50/60 text-emerald-900 border border-emerald-200 text-xs space-y-1">
            <span class="font-bold">Resolution Report:</span>
            <p>\${escapeHtml(c.adminRemarks || 'Work order completed by maintenance technician and certified by supervisor.')}</p>
          </div>

          <!-- 5-Star Interactive Rating -->
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">Rate Service Quality:</span>
            <div class="flex items-center gap-1 text-base cursor-pointer" onclick="showToast('✓ 5-Star Rating submitted! Thank you.')">
              <span class="text-amber-400 hover:scale-125 transition">★</span>
              <span class="text-amber-400 hover:scale-125 transition">★</span>
              <span class="text-amber-400 hover:scale-125 transition">★</span>
              <span class="text-amber-400 hover:scale-125 transition">★</span>
              <span class="text-amber-400 hover:scale-125 transition">★</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button onclick="reopenTicket('\${c.id}')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
              🔄 Issue Reappeared? Reopen
            </button>
          </div>
        </div>
      \`).join('');
    }

    async function markAsResolved(complaintId) {
      const res = await apiFetch('/api/complaints/' + complaintId, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Resolved',
          adminRemarks: 'Resolved and signed off by student ' + activeUser.name + '.'
        })
      });
      if (res && res.success) {
        showToast('✓ Work order #' + complaintId + ' signed off as Resolved!');
        syncComplaintsFromBackend(false);
      }
    }

    async function reopenTicket(complaintId) {
      const res = await apiFetch('/api/complaints/' + complaintId, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'In Progress',
          adminRemarks: 'Reopened by student ' + activeUser.name + ' for reinspection.'
        })
      });
      if (res && res.success) {
        showToast('Ticket #' + complaintId + ' reopened for technician inspection.');
        syncComplaintsFromBackend(false);
      }
    }

    function upvoteTicket(complaintId) {
      const c = backendComplaints.find(item => item.id === complaintId);
      if (c) {
        c.upvotes = (c.upvotes || 0) + 1;
        showToast('✓ +1 Upvote recorded! Priority escalated.');
        renderPendingScreen();
      }
    }

    function renderStudentNotifications() {
      const container = document.getElementById('notif-list-container');
      const unreadEl = document.getElementById('notif-unread-count');
      const notifs = backendNotifications;
      const unreadCount = notifs.filter(n => !n.read).length;

      if (unreadEl) {
        unreadEl.innerText = unreadCount + ' unread';
        unreadEl.className = unreadCount > 0 ? "text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold" : "text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold";
      }

      if (container) {
        if (notifs.length === 0) {
          container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">No new notifications</div>';
        } else {
          container.innerHTML = notifs.slice(0, 8).map(n => \`
            <div class="p-2.5 rounded-xl \${n.read ? 'bg-slate-50/60' : 'bg-blue-50/80 border border-blue-100'} text-xs space-y-0.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900">\${escapeHtml(n.title)}</span>
                <span class="text-[9px] text-slate-400">\${formatTimeAgo(n.timestamp)}</span>
              </div>
              <p class="text-[11px] text-slate-600">\${escapeHtml(n.message)}</p>
            </div>
          \`).join('');
        }
      }
    }

    // Interactive Campus Map Controls
    function selectFloorMap(floor) {
      ['ground', '1', '2', '3', '4'].forEach(f => {
        const btn = document.getElementById('map-f-' + f);
        if (btn) btn.className = "flex-1 py-1.5 rounded-xl text-slate-600 hover:bg-white transition";
      });
      const activeBtn = document.getElementById('map-f-' + (floor === 'Ground' ? 'ground' : floor.charAt(0)));
      if (activeBtn) {
        activeBtn.className = "flex-1 py-1.5 rounded-xl bg-white text-brand-700 shadow-xs font-bold transition";
      }
      showToast('Switched map view to ' + floor + ' Floor');
    }

    function selectPinFromMap(room, block) {
      openDedicatedScreen('report');
      const blockSelect = document.getElementById('report-input-block');
      const roomInput = document.getElementById('report-input-room');
      if (blockSelect) blockSelect.value = block || "A3 Academic Block";
      if (roomInput) roomInput.value = room;
      showToast('📍 Pre-filled location: ' + room);
    }

    // Advisor Direct Channel Interactive Chat
    function sendQuickChatMessage(text) {
      const input = document.getElementById('advisor-chat-input');
      if (input) input.value = text;
      handleSendChatMessage();
    }

    function handleSendChatMessage(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('advisor-chat-input');
      const container = document.getElementById('advisor-chat-messages');
      if (!input || !container) return;

      const text = input.value.trim();
      if (!text) return;

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Student bubble
      const studentBubble = document.createElement('div');
      studentBubble.className = "flex items-start gap-2.5 justify-end";
      studentBubble.innerHTML = \`
        <div class="bg-brand-600 text-white rounded-2xl p-3 shadow-xs max-w-xs text-xs">
          <p>\${escapeHtml(text)}</p>
          <span class="text-[9px] text-brand-200 mt-1 block text-right">\${time} • Sent</span>
        </div>
        <img src="\${activeUser.avatar}" class="w-8 h-8 rounded-full object-cover shrink-0" alt="Me">
      \`;
      container.appendChild(studentBubble);
      input.value = "";
      container.scrollTop = container.scrollHeight;

      // Smart Advisor Reply
      setTimeout(() => {
        const advisorReply = document.createElement('div');
        advisorReply.className = "flex items-start gap-2.5";
        advisorReply.innerHTML = \`
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" class="w-8 h-8 rounded-full object-cover shrink-0" alt="Advisor">
          <div class="bg-white border border-slate-200 shadow-xs max-w-xs text-xs text-slate-800 rounded-2xl p-3">
            <p>Thank you for reporting, \${activeUser.name}. I have marked this in the departmental grievance log and informed Chief Warden Satyanarayana to expedite action.</p>
            <span class="text-[9px] text-slate-400 mt-1 block">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Received</span>
          </div>
        \`;
        container.appendChild(advisorReply);
        container.scrollTop = container.scrollHeight;
      }, 700);
    }

    // Modal Form Submissions
    function simulateSosDispatch(type) {
      showToast('🚨 SOS DISPATCHED: Security & Campus Emergency Team alerted!');
      closeMenuFeatureModals();
    }

    function handleAntiRaggingSubmit(e) {
      if (e) e.preventDefault();
      showToast('✓ Confidential report submitted to Anti-Ragging Committee');
      closeMenuFeatureModals();
    }

    function handleMessFeedbackSubmit(e) {
      if (e) e.preventDefault();
      showToast('✓ Dining & Mess feedback submitted. Thank you!');
      closeMenuFeatureModals();
    }

    function handleWifiRegisterSubmit(e) {
      if (e) e.preventDefault();
      showToast('✓ MAC Address registered! Wi-Fi access approved.');
      closeMenuFeatureModals();
    }

    function handleDevFeedbackSubmit(e) {
      if (e) e.preventDefault();
      showToast('✓ Feedback submitted to Campus Administration');
      closeMenuFeatureModals();
    }

    function resetHeroPhoto() {
      showToast('Hero photo reset to campus default');
    }

    // Live Global Search Modal
    function runTicketSearch(query) {
      const container = document.getElementById('search-results-list');
      if (!container) return;
      const q = (query || '').toLowerCase().trim();
      if (!q) {
        container.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">Type to filter live complaints...</p>';
        return;
      }
      const matches = backendComplaints.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.assignedStaff && c.assignedStaff.toLowerCase().includes(q))
      );
      if (matches.length === 0) {
        container.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">No matching complaints found for "' + escapeHtml(query) + '"</p>';
        return;
      }
      container.innerHTML = matches.map(c => \`
        <div onclick="document.getElementById('search-modal').classList.add('hidden'); openDedicatedScreen('in-progress');" class="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50/50 hover:bg-blue-50/40 cursor-pointer transition text-xs space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-600">\${c.id}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">\${c.status}</span>
          </div>
          <h5 class="font-bold text-slate-800">\${escapeHtml(c.title)}</h5>
          <p class="text-[10.5px] text-slate-500">📍 \${escapeHtml(c.location)}</p>
        </div>
      \`).join('');
    }

    // --- 6. ADMINISTRATIVE DASHBOARD CONTROLLER ---
    function switchAdminNav(tab) {
      document.querySelectorAll('[id^="admin-tab-"]').forEach(t => t.classList.add('hidden'));
      document.querySelectorAll('[id^="admin-nav-"]').forEach(b => {
        b.classList.remove('bg-brand-50', 'text-brand-700', 'dark:bg-brand-950/40', 'dark:text-brand-300');
        b.classList.add('text-slate-600', 'dark:text-slate-300');
      });

      const targetTab = document.getElementById('admin-tab-' + tab);
      const targetNav = document.getElementById('admin-nav-' + tab);
      if (targetTab) targetTab.classList.remove('hidden');
      if (targetNav) {
        targetNav.classList.remove('text-slate-600', 'dark:text-slate-300');
        targetNav.classList.add('bg-brand-50', 'text-brand-700', 'dark:bg-brand-950/40', 'dark:text-brand-300');
      }

      const titleEl = document.getElementById('admin-page-title');
      const subEl = document.getElementById('admin-page-subtitle');
      if (tab === 'overview') {
        if (titleEl) titleEl.innerText = "Administrative Operations Dashboard";
        if (subEl) subEl.innerText = "Live student complaints monitoring & automated maintenance dispatch";
      } else if (tab === 'complaints') {
        if (titleEl) titleEl.innerText = "Complaint Management Console";
        if (subEl) subEl.innerText = "Search, filter, assign technicians and update complaint status";
      } else if (tab === 'students') {
        if (titleEl) titleEl.innerText = "Student Grievance Directory";
        if (subEl) subEl.innerText = "Registered student profiles, enrolled departments and complaint history";
      } else if (tab === 'staff') {
        if (titleEl) titleEl.innerText = "Maintenance Staff & Technician Directory";
        if (subEl) subEl.innerText = "Department allocations, active work orders and availability tracking";
      } else if (tab === 'analytics') {
        if (titleEl) titleEl.innerText = "Maintenance Analytics & Governance Reports";
        if (subEl) subEl.innerText = "Category distributions, resolution ratios and monthly turnaround trends";
      } else if (tab === 'notifications') {
        if (titleEl) titleEl.innerText = "Administrative Alerts & Audit Logs";
        if (subEl) subEl.innerText = "Real-time incident dispatch notifications and SLA escalation logs";
      }

      renderAdminDashboard();
    }

    function renderAdminDashboard() {
      renderAdminKPIs();
      renderAdminCategoryBars();
      renderAdminStatusMatrix();
      renderAdminRecentTable();
      renderAdminComplaintsTable();
      renderAdminStudentsTable();
      renderAdminStaffGrid();
      renderAdminAnalytics();
      renderAdminNotifications();
    }

    function renderAdminKPIs() {
      const stats = backendStats || {
        total: backendComplaints.length,
        pending: backendComplaints.filter(c => c.status === 'Pending').length,
        inProgress: backendComplaints.filter(c => c.status === 'In Progress').length,
        resolved: backendComplaints.filter(c => c.status === 'Resolved').length,
        rejected: backendComplaints.filter(c => c.status === 'Rejected').length,
        critical: backendComplaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Rejected').length
      };

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
      };

      setTxt('kpi-total', stats.total);
      setTxt('kpi-pending', stats.pending);
      setTxt('kpi-inprog', stats.inProgress);
      setTxt('kpi-resolved', stats.resolved);
      setTxt('kpi-rejected', stats.rejected);
      setTxt('kpi-critical', stats.critical);

      setTxt('admin-nav-total-badge', stats.total);

      // Critical Alert Banner
      const banner = document.getElementById('admin-critical-banner');
      const topAlert = document.getElementById('admin-top-critical-alert');
      const critBadge = document.getElementById('admin-nav-critical-badge');

      if (stats.critical > 0) {
        if (banner) banner.classList.remove('hidden');
        if (topAlert) topAlert.classList.remove('hidden');
        if (critBadge) {
          critBadge.innerText = stats.critical;
          critBadge.classList.remove('hidden');
        }
        setTxt('admin-critical-count', stats.critical + ' Urgent');
        setTxt('admin-top-critical-text', stats.critical + ' Critical Hazard' + (stats.critical > 1 ? 's' : '') + ' Active');
      } else {
        if (banner) banner.classList.add('hidden');
        if (topAlert) topAlert.classList.add('hidden');
        if (critBadge) critBadge.classList.add('hidden');
      }
    }

    function openFirstCriticalComplaint() {
      const crit = backendComplaints.find(c => c.priority === 'Critical' && c.status !== 'Resolved');
      if (crit) {
        openAdminComplaintModal(crit.id);
      } else {
        switchAdminNav('complaints');
      }
    }

    function renderAdminCategoryBars() {
      const container = document.getElementById('admin-category-bars');
      if (!container) return;

      const counts = {};
      backendComplaints.forEach(c => {
        counts[c.category] = (counts[c.category] || 0) + 1;
      });

      const total = backendComplaints.length || 1;
      const categories = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

      if (categories.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-400">No complaints recorded.</div>';
        return;
      }

      container.innerHTML = categories.map(cat => {
        const count = counts[cat];
        const pct = Math.round((count / total) * 100);
        return \`
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span class="text-slate-700 dark:text-slate-300">\${escapeHtml(cat)}</span>
              <span class="text-slate-500 font-mono">\${count} (\${pct}%)</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-brand-500 rounded-full transition-all duration-500" style="width: \${pct}%"></div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderAdminStatusMatrix() {
      const container = document.getElementById('admin-status-matrix');
      if (!container) return;

      const total = backendComplaints.length || 1;
      const pending = backendComplaints.filter(c => c.status === 'Pending').length;
      const inProg = backendComplaints.filter(c => c.status === 'In Progress').length;
      const resolved = backendComplaints.filter(c => c.status === 'Resolved').length;
      const rejected = backendComplaints.filter(c => c.status === 'Rejected').length;

      const resPct = Math.round((resolved / total) * 100);

      container.innerHTML = \`
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center font-black shrink-0">
            <span class="text-base leading-tight">\${resPct}%</span>
            <span class="text-[9px] font-bold uppercase">Resolved</span>
          </div>
          <div class="space-y-1 text-xs">
            <h4 class="font-bold text-slate-900 dark:text-white">Campus Resolution Efficiency</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">\${resolved} of \${total} complaints successfully resolved and signed off.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 text-amber-900 dark:text-amber-200">
            <span class="text-[10px] font-bold block uppercase">Pending Triage</span>
            <span class="text-lg font-black">\${pending}</span>
          </div>
          <div class="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 text-blue-900 dark:text-blue-200">
            <span class="text-[10px] font-bold block uppercase">Active Work Orders</span>
            <span class="text-lg font-black">\${inProg}</span>
          </div>
        </div>
      \`;
    }

    function renderAdminRecentTable() {
      const tbody = document.getElementById('admin-recent-tbody');
      if (!tbody) return;

      const recent = backendComplaints.slice(0, 5);
      if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-400">No complaints registered</td></tr>';
        return;
      }

      tbody.innerHTML = recent.map(c => {
        const pBadge = getPriorityBadgeHtml(c.priority);
        const sBadge = getStatusBadgeHtml(c.status);
        return \`
          <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
            <td class="py-3 font-mono font-bold text-brand-600 dark:text-brand-400">\${c.id}</td>
            <td class="py-3">
              <span class="font-bold text-slate-900 dark:text-white block">\${escapeHtml(c.studentName)}</span>
              <span class="text-[10px] text-slate-400 block font-mono">\${c.studentId}</span>
            </td>
            <td class="py-3 max-w-xs">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">\${escapeHtml(c.category)}</span>
              <span class="font-medium text-slate-800 dark:text-slate-200 truncate block">\${escapeHtml(c.title)}</span>
            </td>
            <td class="py-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">\${escapeHtml(c.location)}</td>
            <td class="py-3">\${pBadge}</td>
            <td class="py-3">\${sBadge}</td>
            <td class="py-3 text-right">
              <button onclick="openAdminComplaintModal('\${c.id}')" class="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold text-[11px] transition">
                Manage
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // Filter, Search & Sort All Complaints
    function applyAdminFilters() {
      const search = (document.getElementById('admin-filter-search')?.value || '').toLowerCase().trim();
      const cat = document.getElementById('admin-filter-category')?.value || 'All';
      const dept = document.getElementById('admin-filter-dept')?.value || 'All';
      const status = document.getElementById('admin-filter-status')?.value || 'All';
      const priority = document.getElementById('admin-filter-priority')?.value || 'All';
      const sort = document.getElementById('admin-filter-sort')?.value || 'newest';

      let filtered = [...backendComplaints];

      if (search) {
        filtered = filtered.filter(c =>
          c.id.toLowerCase().includes(search) ||
          c.studentName.toLowerCase().includes(search) ||
          c.studentId.toLowerCase().includes(search) ||
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.location.toLowerCase().includes(search)
        );
      }

      if (cat !== 'All') {
        filtered = filtered.filter(c => c.category === cat);
      }
      if (dept !== 'All') {
        filtered = filtered.filter(c => c.department === dept || c.assignedDepartment === dept);
      }
      if (status !== 'All') {
        filtered = filtered.filter(c => c.status === status);
      }
      if (priority !== 'All') {
        filtered = filtered.filter(c => c.priority === priority);
      }

      const pWeights = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      } else if (sort === 'priority') {
        filtered.sort((a, b) => {
          const diff = (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
          if (diff !== 0) return diff;
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        });
      } else {
        filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      }

      renderAdminComplaintsTable(filtered);
    }

    function resetAdminFilters() {
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      setVal('admin-filter-search', '');
      setVal('admin-filter-category', 'All');
      setVal('admin-filter-dept', 'All');
      setVal('admin-filter-status', 'All');
      setVal('admin-filter-priority', 'All');
      setVal('admin-filter-sort', 'newest');
      applyAdminFilters();
    }

    function renderAdminComplaintsTable(complaintsToRender = null) {
      const tbody = document.getElementById('admin-complaints-tbody');
      const countTag = document.getElementById('admin-complaints-count-tag');
      if (!tbody) return;

      const list = complaintsToRender || backendComplaints;
      if (countTag) countTag.innerText = list.length + ' found';

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-xs text-slate-400">No complaints match current filters.</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(c => {
        const pBadge = getPriorityBadgeHtml(c.priority);
        const sBadge = getStatusBadgeHtml(c.status);
        return \`
          <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
            <td class="py-3">
              <span class="font-mono font-black text-brand-600 dark:text-brand-400 block">\${c.id}</span>
              <span class="text-[10px] text-slate-400 block">\${formatDate(c.submittedAt)}</span>
            </td>
            <td class="py-3">
              <span class="font-bold text-slate-900 dark:text-white block">\${escapeHtml(c.studentName)}</span>
              <span class="text-[10px] text-slate-500 font-mono block">\${c.studentId} • \${escapeHtml(c.department ? c.department.split(' ')[0] : 'CSE')}</span>
            </td>
            <td class="py-3 max-w-xs">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">\${escapeHtml(c.category)}</span>
              <span class="font-medium text-slate-800 dark:text-slate-200 truncate block font-bold">\${escapeHtml(c.title)}</span>
              <span class="text-[11px] text-slate-400 line-clamp-1 block">\${escapeHtml(c.description || '')}</span>
            </td>
            <td class="py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">\${escapeHtml(c.location)}</td>
            <td class="py-3">\${pBadge}</td>
            <td class="py-3">\${sBadge}</td>
            <td class="py-3 text-xs">
              \${c.assignedStaff ? \`
                <span class="font-bold text-slate-800 dark:text-slate-200 block">\${escapeHtml(c.assignedStaff)}</span>
                <span class="text-[10px] text-slate-400 block">\${escapeHtml(c.assignedDepartment || '')}</span>
              \` : '<span class="text-[11px] text-amber-500 font-medium">Unassigned</span>'}
            </td>
            <td class="py-3 text-right">
              <button onclick="openAdminComplaintModal('\${c.id}')" class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition">
                Manage
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // Modal Inspection & Action
    function openAdminComplaintModal(complaintId) {
      const complaint = backendComplaints.find(c => c.id === complaintId);
      if (!complaint) return;
      selectedModalComplaint = complaint;

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
      };

      setTxt('modal-complaint-id', complaint.id);
      setTxt('modal-submitted-time', 'Submitted on ' + formatDate(complaint.submittedAt));
      setTxt('modal-student-name', complaint.studentName);
      setTxt('modal-student-id', complaint.studentId);
      setTxt('modal-student-dept-class', (complaint.department || 'Computer Science') + ' • ' + (complaint.studentClass || 'Class B'));
      setTxt('modal-complaint-title', complaint.title);
      setTxt('modal-complaint-category', complaint.category);
      setTxt('modal-complaint-location', complaint.location);
      setTxt('modal-complaint-desc', complaint.description);

      const pBadge = document.getElementById('modal-priority-badge');
      if (pBadge) {
        pBadge.innerText = complaint.priority;
        pBadge.className = complaint.priority === 'Critical' ? "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse" : "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700";
      }

      const sBadge = document.getElementById('modal-status-badge');
      if (sBadge) {
        sBadge.innerText = complaint.status;
        const color = complaint.status === 'Resolved' ? 'emerald' : complaint.status === 'In Progress' ? 'blue' : complaint.status === 'Rejected' ? 'rose' : 'amber';
        sBadge.className = "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-" + color + "-100 text-" + color + "-800";
      }

      const mediaBox = document.getElementById('modal-media-box');
      const mediaContent = document.getElementById('modal-media-content');
      if (mediaBox && mediaContent) {
        if (complaint.mediaUrl) {
          mediaBox.classList.remove('hidden');
          if (complaint.mediaType === 'video' || complaint.mediaUrl.endsWith('.mp4')) {
            mediaContent.innerHTML = '<video src="' + complaint.mediaUrl + '" controls autoplay muted class="w-full max-h-56 object-contain"></video>';
          } else {
            mediaContent.innerHTML = '<img src="' + complaint.mediaUrl + '" alt="Evidence" class="w-full max-h-56 object-contain">';
          }
        } else {
          mediaBox.classList.add('hidden');
        }
      }

      const statusSelect = document.getElementById('modal-action-status');
      const prioSelect = document.getElementById('modal-action-priority');
      const deptSelect = document.getElementById('modal-action-dept');
      const remarksText = document.getElementById('modal-action-remarks');

      if (statusSelect) statusSelect.value = complaint.status;
      if (prioSelect) prioSelect.value = complaint.priority;
      if (deptSelect) deptSelect.value = complaint.assignedDepartment || "";
      if (remarksText) remarksText.value = complaint.adminRemarks || "";

      updateModalStaffDropdown(complaint.assignedStaff);

      const timelineBox = document.getElementById('modal-timeline-container');
      if (timelineBox) {
        const tl = complaint.timeline || [];
        timelineBox.innerHTML = tl.map(e => \`
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-0.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-900 dark:text-white">\${escapeHtml(e.action)}</span>
              <span class="text-[9px] text-slate-400">\${formatDate(e.time)}</span>
            </div>
            <p class="text-[10px] text-slate-500">\${escapeHtml(e.actor)} • \${escapeHtml(e.note || '')}</p>
          </div>
        \`).join('');
      }

      const modal = document.getElementById('admin-complaint-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function updateModalStaffDropdown(selectedStaffName = null) {
      const dept = document.getElementById('modal-action-dept')?.value;
      const staffSelect = document.getElementById('modal-action-staff');
      if (!staffSelect) return;

      staffSelect.innerHTML = '<option value="">Unassigned</option>';

      let matchingStaff = backendStaff;
      if (dept) {
        matchingStaff = backendStaff.filter(s => s.department === dept);
      }

      matchingStaff.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.innerText = \`\${s.name} (\${s.specialization}) - \${s.status}\`;
        if (selectedStaffName && selectedStaffName === s.name) {
          opt.selected = true;
        }
        staffSelect.appendChild(opt);
      });
    }

    function closeAdminComplaintModal() {
      const modal = document.getElementById('admin-complaint-modal');
      if (modal) modal.classList.add('hidden');
      selectedModalComplaint = null;
    }

    async function saveAdminComplaintChanges() {
      if (!selectedModalComplaint) return;
      const btn = document.getElementById('btn-save-admin-complaint');
      if (btn) {
        btn.disabled = true;
        btn.innerText = "Saving & Notifying Student...";
      }

      const status = document.getElementById('modal-action-status')?.value;
      const priority = document.getElementById('modal-action-priority')?.value;
      const dept = document.getElementById('modal-action-dept')?.value;
      const staff = document.getElementById('modal-action-staff')?.value;
      const remarks = document.getElementById('modal-action-remarks')?.value;

      const payload = {
        status: status,
        priority: priority,
        assignedDepartment: dept,
        assignedStaff: staff,
        adminRemarks: remarks,
        actor: activeUser.name + ' (Admin)'
      };

      const res = await apiFetch('/api/complaints/' + selectedModalComplaint.id, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (btn) {
        btn.disabled = false;
        btn.innerText = "Save Changes & Notify Student";
      }

      if (res && res.success) {
        closeAdminComplaintModal();
        showToast('✓ Complaint ' + res.complaint.id + ' updated! Student notified.');
        syncComplaintsFromBackend(false);
      } else {
        showToast('Update failed: ' + (res.message || 'Unknown error'));
      }
    }

    // Students Table
    function renderAdminStudentsTable() {
      const tbody = document.getElementById('admin-students-tbody');
      if (!tbody) return;

      const students = backendStudents.length > 0 ? backendStudents : [
        { id: "N240001", name: "Aarav", department: "Computer Science & Engineering", studentClass: "3rd Year - Section B", email: "aarav@rgukt.ac.in", phone: "+91 98765 11001" },
        { id: "N240002", name: "Priya Sharma", department: "Electronics & Communication", studentClass: "2nd Year - Section A", email: "priya@rgukt.ac.in", phone: "+91 98765 11002" },
        { id: "N240003", name: "Rahul Varma", department: "Mechanical Engineering", studentClass: "4th Year - Section A", email: "rahul@rgukt.ac.in", phone: "+91 98765 11003" },
        { id: "N240004", name: "Sneha Reddy", department: "Civil Engineering", studentClass: "3rd Year - Section C", email: "sneha@rgukt.ac.in", phone: "+91 98765 11004" },
        { id: "N240005", name: "Ananya Patel", department: "Chemical Engineering", studentClass: "1st Year - Section A", email: "ananya@rgukt.ac.in", phone: "+91 98765 11005" }
      ];

      tbody.innerHTML = students.map(s => {
        const sComplaints = backendComplaints.filter(c => c.studentId === s.id);
        const activeCount = sComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
        return \`
          <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
            <td class="py-3 font-bold text-slate-900 dark:text-white">\${escapeHtml(s.name)}</td>
            <td class="py-3 font-mono font-bold text-brand-600">\${s.id}</td>
            <td class="py-3 text-slate-600 dark:text-slate-300">\${escapeHtml(s.department)}</td>
            <td class="py-3 text-slate-500 text-[11px]">\${escapeHtml(s.studentClass || '3rd Year')}</td>
            <td class="py-3 text-[11px]">
              <span class="block text-slate-700 dark:text-slate-300">\${s.email}</span>
              <span class="text-slate-400 font-mono">\${s.phone || '+91 98765 11001'}</span>
            </td>
            <td class="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">\${sComplaints.length}</td>
            <td class="py-3">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full \${activeCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}">
                \${activeCount} Active
              </span>
            </td>
            <td class="py-3 text-right">
              <button onclick="filterComplaintsByStudent('\${s.name}')" class="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition">
                View Records →
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterComplaintsByStudent(studentName) {
      switchAdminNav('complaints');
      const search = document.getElementById('admin-filter-search');
      if (search) {
        search.value = studentName;
        applyAdminFilters();
      }
    }

    // Staff Grid
    function renderAdminStaffGrid() {
      const container = document.getElementById('admin-staff-grid');
      if (!container) return;

      const staff = backendStaff.length > 0 ? backendStaff : [
        { name: "Vikram Kumar", department: "Electrical", specialization: "Senior Electrician & HT Safety", phone: "+91 98765 43210", status: "Available" },
        { name: "Suresh Babu", department: "Plumbing", specialization: "Master Plumber & Pipeline Diagnostics", phone: "+91 98765 43211", status: "Available" },
        { name: "Rajesh Verma", department: "IT & Audio-Visual", specialization: "Smart Classroom & AV Systems Engineer", phone: "+91 98765 43212", status: "Busy" },
        { name: "Anand Rao", department: "Civil Infrastructure", specialization: "Carpentry, Glassworks & Masonry", phone: "+91 98765 43213", status: "Available" },
        { name: "K. Ramesh", department: "Housekeeping & Sanitation", specialization: "Sanitation Supervisor", phone: "+91 98765 43214", status: "Available" },
        { name: "Sandeep Reddy", department: "HVAC & Air Conditioning", specialization: "Central HVAC & Duct Maintenance", phone: "+91 98765 43215", status: "Available" }
      ];

      container.innerHTML = staff.map(s => {
        const assigned = backendComplaints.filter(c => c.assignedStaff === s.name && c.status !== 'Resolved');
        return \`
          <div class="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">\${escapeHtml(s.department)}</span>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">\${escapeHtml(s.name)}</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">\${escapeHtml(s.specialization)}</p>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full \${s.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                \${s.status}
              </span>
            </div>

            <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <span class="text-slate-500 font-medium">Active Jobs: <b>\${assigned.length}</b></span>
              <a href="tel:\${s.phone}" class="text-brand-600 font-bold flex items-center gap-1 hover:underline">
                <span>📞</span><span>\${s.phone}</span>
              </a>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Analytics Tab
    function renderAdminAnalytics() {
      const monthlyBox = document.getElementById('chart-monthly-bars');
      if (monthlyBox) {
        const months = [
          { m: 'Jun', total: 14, res: 12 },
          { m: 'Jul', total: 19, res: 18 },
          { m: 'Aug', total: 28, res: 25 },
          { m: 'Sep', total: 34, res: 31 },
          { m: 'Oct', total: 42, res: 38 },
          { m: 'Nov', total: backendComplaints.length || 6, res: backendComplaints.filter(c => c.status === 'Resolved').length || 1 }
        ];

        const max = 50;
        monthlyBox.innerHTML = months.map(item => {
          const hTotal = Math.max(15, Math.round((item.total / max) * 100));
          const hRes = Math.max(10, Math.round((item.res / max) * 100));
          return \`
            <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span class="text-[9px] font-mono font-bold text-slate-400">\${item.total}</span>
              <div class="w-full flex items-end justify-center gap-1 h-32">
                <div class="w-3 bg-brand-500 rounded-t-sm transition-all duration-500" style="height: \${hTotal}%" title="Received: \${item.total}"></div>
                <div class="w-3 bg-emerald-500 rounded-t-sm transition-all duration-500" style="height: \${hRes}%" title="Resolved: \${item.res}"></div>
              </div>
              <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300">\${item.m}</span>
            </div>
          \`;
        }).join('');
      }

      const deptBox = document.getElementById('chart-dept-bars');
      if (deptBox) {
        const depts = {};
        backendComplaints.forEach(c => {
          const d = c.department || 'Computer Science';
          depts[d] = (depts[d] || 0) + 1;
        });

        const total = backendComplaints.length || 1;
        deptBox.innerHTML = Object.keys(depts).map(d => {
          const count = depts[d];
          const pct = Math.round((count / total) * 100);
          return \`
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-700 dark:text-slate-300">\${escapeHtml(d)}</span>
                <span class="text-slate-400 font-mono">\${count} complaints (\${pct}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full" style="width: \${pct}%"></div>
              </div>
            </div>
          \`;
        }).join('');
      }
    }

    // Admin Notifications
    function renderAdminNotifications() {
      const list = document.getElementById('admin-notifications-list');
      const dot = document.getElementById('admin-header-notif-dot');
      const badge = document.getElementById('admin-nav-notif-badge');
      if (!list) return;

      const notifs = backendNotifications;
      const unreadCount = notifs.filter(n => !n.read).length;

      if (unreadCount > 0) {
        if (dot) dot.classList.remove('hidden');
        if (badge) {
          badge.innerText = unreadCount;
          badge.classList.remove('hidden');
        }
      } else {
        if (dot) dot.classList.add('hidden');
        if (badge) badge.classList.add('hidden');
      }

      if (notifs.length === 0) {
        list.innerHTML = '<div class="p-6 text-center text-xs text-slate-400">No administrative alerts recorded.</div>';
        return;
      }

      list.innerHTML = notifs.map(n => \`
        <div class="p-4 rounded-2xl \${n.read ? 'bg-slate-50 dark:bg-slate-800/40' : 'bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800'} space-y-1">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white">\${escapeHtml(n.title)}</h4>
            <span class="text-[10px] text-slate-400 font-mono">\${formatDate(n.timestamp)}</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300">\${escapeHtml(n.message)}</p>
        </div>
      \`).join('');
    }

    async function markAllAdminNotificationsRead() {
      await apiFetch('/api/notifications/mark-all-read?role=admin', { method: 'POST' });
      showToast('All notifications marked as read');
      syncComplaintsFromBackend(false);
    }

    // Helper functions
    function getPriorityBadgeHtml(priority) {
      if (priority === 'Critical') {
        return '<span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">🚨 Critical</span>';
      } else if (priority === 'High') {
        return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">High</span>';
      } else if (priority === 'Low') {
        return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Low</span>';
      }
      return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Medium</span>';
    }

    function getStatusBadgeHtml(status) {
      if (status === 'Resolved') {
        return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Resolved</span>';
      } else if (status === 'In Progress') {
        return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">In Progress</span>';
      } else if (status === 'Rejected') {
        return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Rejected</span>';
      }
      return '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pending</span>';
    }

    function formatDate(isoStr) {
      if (!isoStr) return '';
      try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return isoStr;
      }
    }

    function formatTimeAgo(isoStr) {
      if (!isoStr) return '';
      try {
        const diffMs = Date.now() - new Date(isoStr).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        return Math.floor(hrs / 24) + 'd ago';
      } catch (e) {
        return '';
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function showToast(msg) {
      const toast = document.getElementById('global-toast');
      const text = document.getElementById('toast-text');
      if (!toast || !text) return;

      text.innerText = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2600);
    }

    // Modal, Drawer & Search Helpers
    function toggleSideDrawer(open) {
      const drawer = document.getElementById('side-drawer');
      const backdrop = document.getElementById('drawer-backdrop');
      const panel = document.getElementById('drawer-panel');
      if (!drawer || !backdrop || !panel) return;

      if (open) {
        drawer.classList.remove('pointer-events-none');
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        panel.classList.remove('-translate-x-full');
        panel.classList.add('translate-x-0');
      } else {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        panel.classList.remove('translate-x-0');
        panel.classList.add('-translate-x-full');
        setTimeout(() => drawer.classList.add('pointer-events-none'), 300);
      }
    }

    function toggleNotificationTray() {
      const tray = document.getElementById('notif-tray');
      if (tray) tray.classList.toggle('hidden');
    }

    function openSearchModal() {
      const modal = document.getElementById('search-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeSearchModal() {
      const modal = document.getElementById('search-modal');
      if (modal) modal.classList.add('hidden');
    }

    function switchTab(tabId) {
      document.querySelectorAll('.view-screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
        s.style.opacity = '0';
      });

      const target = document.getElementById('view-' + tabId);
      if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        setTimeout(() => target.style.opacity = '1', 10);
      }
    }

    function openMenuFeatureModal(id) {
      document.querySelectorAll('[id^="modal-feature-"]').forEach(m => m.classList.add('hidden'));
      const target = document.getElementById('modal-feature-' + id);
      if (target) target.classList.remove('hidden');
    }

    function closeMenuFeatureModals() {
      document.querySelectorAll('[id^="modal-feature-"]').forEach(m => m.classList.add('hidden'));
    }

    function resetDemoData() {
      apiFetch('/api/complaints', { method: 'GET' }).then(() => {
        showToast('✓ Demo data loaded and ready!');
        syncComplaintsFromBackend(false);
      });
    }

    // Initialize on window load
    window.onload = function() {
      const savedUserRole = localStorage.getItem('campuscare_active_user');
      if (savedUserRole && demoUsers[savedUserRole]) {
        activeUser = demoUsers[savedUserRole];
      } else {
        activeUser = demoUsers.student;
      }

      applyStudentUserData();
      syncComplaintsFromBackend(false);
    };
  </script>
`;

const indexPath = 'c:/Users/its mee u know/Downloads/rahul dt/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

const sIdx = html.indexOf('<script>\n    // --- 1. DARK MODE');
if (sIdx !== -1) {
  html = html.substring(0, sIdx) + controllerCode.trim() + '\n</body></html>';
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Successfully updated index.html with all working handlers!');
} else {
  console.error('Could not find script start');
}
