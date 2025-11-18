const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const router = express.Router();

// An internal route to execute the check_db script on the server host.
// Protect it with a token stored in `INTERNAL_CHECK_TOKEN` env var.

router.post('/check-db', async (req, res) => {
  const token = process.env.INTERNAL_CHECK_TOKEN;
  if (!token) return res.status(403).json({ success: false, message: 'Internal checks are disabled on this host' });

  const provided = req.get('Authorization') || req.get('X-Internal-Token');
  if (!provided || (provided !== `Bearer ${token}` && provided !== token)) {
    return res.status(401).json({ success: false, message: 'Invalid internal token' });
  }

  const scriptPath = path.join(__dirname, '..', 'scripts', 'check_db.js');
  // Spawn a child process to run the script and collect output
  const child = spawn(process.execPath, [scriptPath], { env: process.env, cwd: path.join(__dirname, '..') });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (d) => { stdout += d.toString(); });
  child.stderr.on('data', (d) => { stderr += d.toString(); });

  child.on('close', (code) => {
    const ok = code === 0;
    res.json({ success: ok, exitCode: code, stdout: stdout.slice(0, 20000), stderr: stderr.slice(0, 20000) });
  });
});

module.exports = { router };
