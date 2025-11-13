// Simple health check script for the backend
// Usage:
//   node scripts/test-backend.js           # uses default backend URL
//   BACKEND_URL=https://your-backend node scripts/test-backend.js  # override

const DEFAULT_BACKEND = 'https://apsara-report-backend-3.onrender.com';

(async () => {
  try {
    const base = process.env.BACKEND_URL || DEFAULT_BACKEND;
    const url = `${base.replace(/\/+$/, '')}/api/health`;
    console.log(`Checking backend health at: ${url}`);

    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { /* not JSON */ }

    console.log(`Status: ${res.status} ${res.statusText}`);
    if (data) {
      console.log('Response JSON:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('Response body:');
      console.log(text);
    }

    if (!res.ok) process.exitCode = 2;
    else process.exitCode = 0;
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exitCode = 3;
  }
})();
