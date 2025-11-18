const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Try to mount internal routes if present
try {
  const internal = require('./routes/internal');
  if (internal && internal.router) {
    app.use('/api/internal', internal.router);
  }
} catch (err) {
  console.warn('Internal routes not available:', err.message);
}

// Serve client static files optionally
const clientDir = path.join(__dirname, '..', 'client');
try {
  app.use(express.static(clientDir));
} catch (err) {
  // ignore
}

const port = process.env.PORT || process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`Apsara Report server listening on port ${port}`);
});

// Graceful handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
