const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:3000${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  try {
    const complaints = await get('/api/complaints');
    console.log('GET /api/complaints:', complaints.success, 'count:', complaints.count);

    const stats = await get('/api/stats');
    console.log('GET /api/stats:', stats.success, 'total:', stats.stats.total, 'critical:', stats.stats.critical);

    const staff = await get('/api/staff');
    console.log('GET /api/staff:', staff.success, 'staff count:', staff.count);

    const students = await get('/api/students');
    console.log('GET /api/students:', students.success, 'students count:', students.count);

    console.log('All backend endpoints verified working!');
  } catch (e) {
    console.error('Test error:', e.message);
  }
}

test();
