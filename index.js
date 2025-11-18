// Root wrapper that ensures many hosting platforms can start the server
// by using `node index.js` at repository root. It simply delegates to server/index.js
try {
  require('./server/index');
} catch (err) {
  console.error('Failed to start server from root wrapper; server/index.js missing or failed to load.');
  console.error(err.stack || err.message || err);
  process.exit(1);
}
