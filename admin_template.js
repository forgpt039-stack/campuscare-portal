// Module: Admin Dashboard HTML Component
module.exports = `
  <!-- ======================================================== -->
  <!-- ADMINISTRATIVE DASHBOARD VIEW (ADMIN ONLY)               -->
  <!-- ======================================================== -->
  <div id="admin-app-view" class="hidden min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row font-sans">

    <!-- Desktop Sidebar Navigation -->
    <aside class="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 z-30 shadow-xs">
      <div>
        <!-- Admin Branding Header -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-brand-500/20">
              CC
            </div>
            <div>
              <h1 class="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-tight">CampusCare</h1>
              <span class="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block">Admin Console</span>
            </div>
          </div>
          <button onclick="toggleDarkMode()" class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="Toggle Theme">
            🌓
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-3 space-y-1">
          <button onclick="switchAdminNav('overview')" id="admin-nav-overview" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 transition">
            <span class="flex items-center gap-2.5">
              <span>📊</span>
              <span>Overview & KPIs</span>
            </span>
            <span id="admin-nav-critical-badge" class="hidden text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">0</span>
          </button>

          <button onclick="switchAdminNav('complaints')" id="admin-nav-complaints" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span class="flex items-center gap-2.5">
              <span>📋</span>
              <span>All Complaints</span>
            </span>
            <span id="admin-nav-total-badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">0</span>
          </button>

          <button onclick="switchAdminNav('students')" id="admin-nav-students" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span class="flex items-center gap-2.5">
              <span>👥</span>
              <span>Student Directory</span>
            </span>
            <span id="admin-nav-students-badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">5</span>
          </button>

          <button onclick="switchAdminNav('staff')" id="admin-nav-staff" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span class="flex items-center gap-2.5">
              <span>🛠️</span>
              <span>Staff & Assignment</span>
            </span>
            <span id="admin-nav-staff-badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">6</span>
          </button>

          <button onclick="switchAdminNav('analytics')" id="admin-nav-analytics" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span class="flex items-center gap-2.5">
              <span>📈</span>
              <span>Analytics & Trends</span>
            </span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">Reports</span>
          </button>

          <button onclick="switchAdminNav('notifications')" id="admin-nav-notifications" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span class="flex items-center gap-2.5">
              <span>🔔</span>
              <span>Alerts & Notifications</span>
            </span>
            <span id="admin-nav-notif-badge" class="hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">0</span>
          </button>
        </nav>
      </div>

      <!-- Administrator Profile Card & Logout -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center gap-3">
          <img id="admin-profile-avatar" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80" class="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/30" alt="Admin">
          <div class="min-w-0 flex-1">
            <h4 id="admin-profile-name" class="text-xs font-bold text-slate-900 dark:text-white truncate">M. Satyanarayana</h4>
            <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 block truncate">Chief Estate Officer</span>
          </div>
        </div>

        <button onclick="triggerLogout()" class="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5">
          <span>🚪</span>
          <span>Logout & Lock Console</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">

      <!-- Top Sticky Bar -->
      <header class="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div>
          <h2 id="admin-page-title" class="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight">Administrative Operations Dashboard</h2>
          <p id="admin-page-subtitle" class="text-xs text-slate-500 dark:text-slate-400">Live student complaints monitoring & automated maintenance dispatch</p>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Critical Hazard Pill -->
          <div id="admin-top-critical-alert" class="hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-pulse">
            <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            <span id="admin-top-critical-text">1 Critical Hazard Active</span>
          </div>

          <!-- Quick Refresh Button -->
          <button onclick="syncComplaintsFromBackend(true)" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Refresh Live Data">
            <span>🔄</span>
            <span class="hidden sm:inline">Sync Data</span>
          </button>

          <!-- Notification Bell -->
          <button onclick="switchAdminNav('notifications')" class="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition">
            <span>🔔</span>
            <span id="admin-header-notif-dot" class="hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
          </button>
        </div>
      </header>

      <!-- TAB 1: OVERVIEW -->
      <div id="admin-tab-overview" class="p-4 lg:p-8 space-y-6">

        <!-- Prominent Critical Complaints Banner -->
        <div id="admin-critical-banner" class="hidden p-4 rounded-3xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">🚨</span>
              <h3 class="text-sm font-black uppercase tracking-wider">Critical Safety & Infrastructure Emergency Detected</h3>
            </div>
            <span id="admin-critical-count" class="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-rose-600">1 Urgent</span>
          </div>
          <p id="admin-critical-desc" class="text-xs text-rose-100 font-medium">Exposed live wiring and sparking switchboard reported near VLSI Lab. Urgent electrical isolation required.</p>
          <div class="pt-1 flex items-center gap-2">
            <button onclick="openFirstCriticalComplaint()" class="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs shadow-xs hover:bg-rose-50 transition">
              Inspect & Dispatch Maintenance Now →
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <!-- Total -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Received</span>
            <div id="kpi-total" class="text-2xl font-black text-slate-900 dark:text-white">0</div>
            <span class="text-[10px] text-slate-400 block font-medium">All recorded tickets</span>
          </div>

          <!-- Pending -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-xs space-y-1">
            <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Pending</span>
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            </span>
            <div id="kpi-pending" class="text-2xl font-black text-amber-600 dark:text-amber-400">0</div>
            <span class="text-[10px] text-amber-600/80 block font-medium">Awaiting assignment</span>
          </div>

          <!-- In Progress -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/40 shadow-xs space-y-1">
            <span class="text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center justify-between">
              <span>In Progress</span>
              <span class="w-2 h-2 rounded-full bg-brand-500"></span>
            </span>
            <div id="kpi-inprog" class="text-2xl font-black text-brand-600 dark:text-brand-400">0</div>
            <span class="text-[10px] text-brand-600/80 block font-medium">Technicians on-site</span>
          </div>

          <!-- Resolved -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs space-y-1">
            <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Resolved</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </span>
            <div id="kpi-resolved" class="text-2xl font-black text-emerald-600 dark:text-emerald-400">0</div>
            <span class="text-[10px] text-emerald-600/80 block font-medium">Signed off repairs</span>
          </div>

          <!-- Rejected -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-1">
            <span class="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Rejected</span>
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            </span>
            <div id="kpi-rejected" class="text-2xl font-black text-rose-600 dark:text-rose-400">0</div>
            <span class="text-[10px] text-rose-600/80 block font-medium">Policy non-compliant</span>
          </div>

          <!-- Critical Hazards -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900 shadow-xs space-y-1">
            <span class="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center justify-between">
              <span>Critical</span>
              <span class="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            </span>
            <div id="kpi-critical" class="text-2xl font-black text-red-600 dark:text-red-400">0</div>
            <span class="text-[10px] text-red-600/80 block font-medium">Urgent attention</span>
          </div>
        </div>

        <!-- Overview Analytics Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Card A: Category Breakdown -->
          <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Complaints by Category</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Distribution across college infrastructure domains</p>
              </div>
              <span class="text-xs font-bold text-brand-600">Real-time</span>
            </div>

            <!-- Dynamic Category Bars Container -->
            <div id="admin-category-bars" class="space-y-3 pt-1">
              <!-- Rendered via JS -->
            </div>
          </div>

          <!-- Card B: Status & Priority Matrix -->
          <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Status & Priority Breakdown</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Resolution lifecycle and urgency metrics</p>
              </div>
              <span class="text-xs font-bold text-emerald-600">SLA Active</span>
            </div>

            <div id="admin-status-matrix" class="space-y-4 pt-1">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

        <!-- Recently Submitted Student Complaints -->
        <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Recently Submitted Complaints</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Direct student submissions awaiting verification or updates</p>
            </div>
            <button onclick="switchAdminNav('complaints')" class="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All Complaints (Filtered) →
            </button>
          </div>

          <div class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th class="pb-2.5">ID</th>
                  <th class="pb-2.5">Student</th>
                  <th class="pb-2.5">Category & Title</th>
                  <th class="pb-2.5">Location</th>
                  <th class="pb-2.5">Priority</th>
                  <th class="pb-2.5">Status</th>
                  <th class="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody id="admin-recent-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: ALL COMPLAINTS MANAGEMENT -->
      <div id="admin-tab-complaints" class="hidden p-4 lg:p-8 space-y-5">
        
        <!-- Filter and Search Toolbar -->
        <div class="p-4 lg:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <!-- Search Bar -->
          <div class="relative">
            <span class="absolute inset-y-0 left-3.5 flex items-center text-slate-400 text-sm">🔍</span>
            <input type="text" id="admin-filter-search" oninput="applyAdminFilters()" placeholder="Search by Complaint ID (e.g. CMP-2026-101), Student Name (Aarav), Title or Room..." class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500">
          </div>

          <!-- Multi-Filter Dropdowns Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <!-- Category -->
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
              <select id="admin-filter-category" onchange="applyAdminFilters()" class="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <option value="All">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="IT & Audio-Visual">IT & Audio-Visual</option>
                <option value="Hostel & Living">Hostel & Living</option>
                <option value="Civil Infrastructure">Civil Infrastructure</option>
                <option value="Safety & Security">Safety & Security</option>
                <option value="Lab Facilities">Lab Facilities</option>
                <option value="Cleanliness & Sanitation">Cleanliness & Sanitation</option>
              </select>
            </div>

            <!-- Department -->
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Department</label>
              <select id="admin-filter-dept" onchange="applyAdminFilters()" class="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <option value="All">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science</option>
                <option value="Electronics & Communication">Electronics (ECE)</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Civil Engineering">Civil</option>
                <option value="Chemical Engineering">Chemical</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select id="admin-filter-status" onchange="applyAdminFilters()" class="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <!-- Priority -->
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
              <select id="admin-filter-priority" onchange="applyAdminFilters()" class="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <option value="All">All Priorities</option>
                <option value="Critical">Critical (Urgent)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <!-- Sort -->
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort Order</label>
              <select id="admin-filter-sort" onchange="applyAdminFilters()" class="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Highest Priority</option>
              </select>
            </div>

            <!-- Clear Filters -->
            <div class="flex items-end">
              <button onclick="resetAdminFilters()" class="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition">
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Complaints Table Container -->
        <div class="p-4 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Active Complaint Records</h3>
              <span id="admin-complaints-count-tag" class="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">0 found</span>
            </div>
          </div>

          <div class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th class="pb-3">ID & Date</th>
                  <th class="pb-3">Student Info</th>
                  <th class="pb-3">Category & Title</th>
                  <th class="pb-3">Location</th>
                  <th class="pb-3">Priority</th>
                  <th class="pb-3">Status</th>
                  <th class="pb-3">Assigned Staff</th>
                  <th class="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="admin-complaints-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: STUDENT MANAGEMENT -->
      <div id="admin-tab-students" class="hidden p-4 lg:p-8 space-y-5">
        <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Registered Student Profiles</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Campus students with grievance history and active work order requests</p>
          </div>

          <div class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th class="pb-3">Student Name</th>
                  <th class="pb-3">Student ID</th>
                  <th class="pb-3">Department</th>
                  <th class="pb-3">Class / Year</th>
                  <th class="pb-3">Email & Contact</th>
                  <th class="pb-3">Total Complaints</th>
                  <th class="pb-3">Active Tickets</th>
                  <th class="pb-3 text-right">View Complaints</th>
                </tr>
              </thead>
              <tbody id="admin-students-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: STAFF & MAINTENANCE ASSIGNMENT -->
      <div id="admin-tab-staff" class="hidden p-4 lg:p-8 space-y-5">
        <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Maintenance Staff & Technician Directory</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Department technicians, current job allocations, and direct contacts</p>
            </div>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">All Teams Active</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="admin-staff-grid">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>

      <!-- TAB 5: ANALYTICS & REPORTS -->
      <div id="admin-tab-analytics" class="hidden p-4 lg:p-8 space-y-6">
        <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">College Maintenance & Grievance Report</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Aggregated infrastructure metrics, category trends, and resolution performance</p>
            </div>
            <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5">
              <span>🖨️</span>
              <span>Print / Export Summary Report</span>
            </button>
          </div>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <!-- Chart 1: Monthly Trends -->
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 class="text-xs font-bold text-slate-700 dark:text-slate-200">Monthly Complaint Volume & Resolution Rate</h4>
              <div id="chart-monthly-bars" class="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                <!-- Monthly trend columns -->
              </div>
            </div>

            <!-- Chart 2: Department-wise Complaints -->
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 class="text-xs font-bold text-slate-700 dark:text-slate-200">Department-wise Complaint Inflow</h4>
              <div id="chart-dept-bars" class="space-y-2.5 pt-2">
                <!-- Dept bars -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 6: NOTIFICATIONS -->
      <div id="admin-tab-notifications" class="hidden p-4 lg:p-8 space-y-5">
        <div class="p-5 lg:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Administrative Notifications & Alerts</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Incoming student complaints and escalation logs</p>
            </div>
            <button onclick="markAllAdminNotificationsRead()" class="text-xs font-bold text-brand-600 hover:text-brand-700">
              Mark All as Read
            </button>
          </div>

          <div id="admin-notifications-list" class="space-y-2.5">
            <!-- Dynamic notifs -->
          </div>
        </div>
      </div>

    </main>
  </div>

  <!-- ======================================================== -->
  <!-- ADMIN COMPLAINT INSPECTION & ACTION MODAL                -->
  <!-- ======================================================== -->
  <div id="admin-complaint-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs hidden flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">

      <!-- Modal Header -->
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span id="modal-complaint-id" class="text-sm font-black text-brand-600 dark:text-brand-400">CMP-2026-101</span>
            <span id="modal-priority-badge" class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">High</span>
            <span id="modal-status-badge" class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">In Progress</span>
          </div>
          <span id="modal-submitted-time" class="text-[11px] text-slate-400 mt-0.5 block">Submitted on 21 Oct 2026, 10:24 AM</span>
        </div>
        <button onclick="closeAdminComplaintModal()" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center text-sm font-bold">
          ✕
        </button>
      </div>

      <!-- Student Info Card -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
          👤
        </div>
        <div class="min-w-0 flex-1 text-xs">
          <div class="flex items-center gap-2">
            <span id="modal-student-name" class="font-bold text-slate-900 dark:text-white">Aarav</span>
            <span id="modal-student-id" class="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">N240001</span>
          </div>
          <p id="modal-student-dept-class" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Computer Science & Engineering • 3rd Year - Section B</p>
        </div>
      </div>

      <!-- Issue Details -->
      <div class="space-y-3">
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Title</span>
          <h4 id="modal-complaint-title" class="text-sm font-bold text-slate-900 dark:text-white">Classroom projector black screen</h4>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] font-bold text-slate-400 block">Category</span>
            <span id="modal-complaint-category" class="font-semibold text-slate-800 dark:text-slate-200">IT & Audio-Visual</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] font-bold text-slate-400 block">Exact Location</span>
            <span id="modal-complaint-location" class="font-semibold text-slate-800 dark:text-slate-200 truncate block">A3 Block > Room 204</span>
          </div>
        </div>

        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</span>
          <p id="modal-complaint-desc" class="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            Description details...
          </p>
        </div>

        <!-- Uploaded Photo or Video Preview -->
        <div id="modal-media-box" class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Evidence (Photo/Video)</span>
          <div id="modal-media-content" class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black flex items-center justify-center max-h-56">
            <!-- Inserted dynamically -->
          </div>
        </div>
      </div>

      <!-- Administrative Action Form -->
      <div class="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>🛠️</span>
          <span>Administrative Complaint Management</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Change Status -->
          <div>
            <label class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Update Status *</label>
            <select id="modal-action-status" class="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              <option value="Pending">Pending (Under Review)</option>
              <option value="In Progress">In Progress (Technician Assigned)</option>
              <option value="Resolved">Resolved (Work Completed)</option>
              <option value="Rejected">Rejected (Non-Compliant)</option>
            </select>
          </div>

          <!-- Change Priority -->
          <div>
            <label class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Urgency / Priority *</label>
            <select id="modal-action-priority" class="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">🚨 Critical (Safety Hazard)</option>
            </select>
          </div>

          <!-- Assign Maintenance Department -->
          <div>
            <label class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Assign Department</label>
            <select id="modal-action-dept" onchange="updateModalStaffDropdown()" class="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              <option value="">Unassigned</option>
              <option value="Electrical">Electrical Department</option>
              <option value="Plumbing">Plumbing & Water Works</option>
              <option value="IT & Audio-Visual">IT & Audio-Visual</option>
              <option value="Civil Infrastructure">Civil Infrastructure</option>
              <option value="Housekeeping & Sanitation">Housekeeping & Sanitation</option>
              <option value="HVAC & Air Conditioning">HVAC & Air Conditioning</option>
            </select>
          </div>

          <!-- Assign Staff / Technician -->
          <div>
            <label class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Assign Responsible Staff</label>
            <select id="modal-action-staff" class="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              <option value="">Unassigned</option>
              <!-- Populated dynamically -->
            </select>
          </div>
        </div>

        <!-- Admin Remarks -->
        <div>
          <label class="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Administrative Remarks & Updates (Visible to Student)</label>
          <textarea id="modal-action-remarks" rows="2" placeholder="e.g. Technician dispatched with spare optical lamp module. Completion expected by 2 PM." class="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"></textarea>
        </div>

        <button onclick="saveAdminComplaintChanges()" id="btn-save-admin-complaint" class="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/30 transition flex items-center justify-center gap-2">
          <span>💾</span>
          <span>Save Changes & Notify Student</span>
        </button>
      </div>

      <!-- Chronological Activity Timeline -->
      <div class="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Trail & Activity Timeline</span>
        <div id="modal-timeline-container" class="space-y-2 text-xs">
          <!-- Timeline entries -->
        </div>
      </div>

    </div>
  </div>
`;
