require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'assets'));
  },
  filename: function (req, file, cb) {
    cb(null, 'resume.pdf'); // always save as resume.pdf
  }
});
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 3000;

const PORTFOLIO_FILE = path.join(__dirname, 'data', 'portfolio.json');
const CHANGES_FILE = path.join(__dirname, 'data', 'changes.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

// Root password configuration from environment
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cybersecurity';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'admin-session-secure-token';

app.use(helmet({
  contentSecurityPolicy: false, // Disabled to prevent breaking existing frontend assets
}));
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper functions for reading/writing files
const readJsonFile = (filePath, defaultVal = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultVal;
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Auth middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === `Bearer ${AUTH_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
};

// Public Endpoint: Fetch portfolio data
app.get('/api/portfolio', (req, res) => {
  const data = readJsonFile(PORTFOLIO_FILE, {});
  res.json(data);
});

// Public Endpoint: Submit contact form message
app.post('/api/contact', (req, res) => {
  const { name, email, inquiry, message, company } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const messages = readJsonFile(MESSAGES_FILE);
  const newMessage = {
    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
    name,
    email,
    inquiry,
    message,
    company: company || '',
    timestamp: new Date().toISOString(),
    status: 'unread'
  };

  messages.push(newMessage);
  if (writeJsonFile(MESSAGES_FILE, messages)) {
    res.json({ success: true, message: 'Message sent successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Admin Endpoint: Login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: AUTH_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin Endpoint: Upload Resume (Requires Auth)
app.post('/api/admin/resume', requireAuth, upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ success: true, message: 'Resume uploaded successfully', path: '/assets/resume.pdf' });
});

// Admin Endpoint: Propose content modification (Requires Auth)
app.post('/api/portfolio/propose', requireAuth, (req, res) => {
  const { type, section, description, content, oldContent, elementId } = req.body;
  
  if (!type || !section || !content) {
    return res.status(400).json({ error: 'Missing required change details' });
  }

  const changes = readJsonFile(CHANGES_FILE);
  const newChange = {
    id: 'chg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    type,
    section,
    description: description || `Update ${section}`,
    content,
    oldContent: oldContent || null,
    elementId: elementId || null,
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  changes.push(newChange);
  if (writeJsonFile(CHANGES_FILE, changes)) {
    res.json({ success: true, change: newChange });
  } else {
    res.status(500).json({ error: 'Failed to record change proposal' });
  }
});

// Admin Endpoint: Get all changes (Requires Auth)
app.get('/api/portfolio/changes', requireAuth, (req, res) => {
  const changes = readJsonFile(CHANGES_FILE);
  res.json(changes);
});

// Admin Endpoint: Approve a change proposal (Requires Auth)
app.post('/api/portfolio/changes/:id/approve', requireAuth, (req, res) => {
  const changeId = req.params.id;
  const changes = readJsonFile(CHANGES_FILE);
  const changeIdx = changes.findIndex(c => c.id === changeId);

  if (changeIdx === -1) {
    return res.status(404).json({ error: 'Change proposal not found' });
  }

  const change = changes[changeIdx];
  if (change.status !== 'pending') {
    return res.status(400).json({ error: `Change already ${change.status}` });
  }

  // Load portfolio database
  const portfolio = readJsonFile(PORTFOLIO_FILE, {});

  // Apply change to portfolio object
  // Section can be 'about', 'skills', 'projects', 'certifications', 'hero', 'experience'
  const section = change.section;
  
  if (section === 'about' || section === 'hero' || section === 'experience') {
    portfolio[section] = change.content;
  } else if (section === 'skills') {
    portfolio.skills = change.content;
  } else if (section === 'projects') {
    portfolio.projects = change.content;
  } else if (section === 'certifications') {
    portfolio.certifications = change.content;
  } else {
    return res.status(400).json({ error: `Unknown section: ${section}` });
  }

  // Update status of proposal
  change.status = 'approved';
  change.approvedAt = new Date().toISOString();

  // Save changes to files
  const savedPortfolio = writeJsonFile(PORTFOLIO_FILE, portfolio);
  const savedChanges = writeJsonFile(CHANGES_FILE, changes);

  if (savedPortfolio && savedChanges) {
    res.json({ success: true, message: 'Change approved and applied successfully' });
  } else {
    res.status(500).json({ error: 'Failed to apply approval updates' });
  }
});

// Admin Endpoint: Reject a change proposal (Requires Auth)
app.post('/api/portfolio/changes/:id/reject', requireAuth, (req, res) => {
  const changeId = req.params.id;
  const changes = readJsonFile(CHANGES_FILE);
  const changeIdx = changes.findIndex(c => c.id === changeId);

  if (changeIdx === -1) {
    return res.status(404).json({ error: 'Change proposal not found' });
  }

  const change = changes[changeIdx];
  if (change.status !== 'pending') {
    return res.status(400).json({ error: `Change already ${change.status}` });
  }

  change.status = 'rejected';
  change.rejectedAt = new Date().toISOString();

  if (writeJsonFile(CHANGES_FILE, changes)) {
    res.json({ success: true, message: 'Change rejected and discarded' });
  } else {
    res.status(500).json({ error: 'Failed to update change rejection status' });
  }
});

// Admin Endpoint: Get contact messages (Requires Auth)
app.get('/api/messages', requireAuth, (req, res) => {
  const messages = readJsonFile(MESSAGES_FILE);
  res.json(messages);
});

// Admin Endpoint: Mark a contact message as read (Requires Auth)
app.post('/api/messages/:id/read', requireAuth, (req, res) => {
  const msgId = req.params.id;
  const messages = readJsonFile(MESSAGES_FILE);
  const msgIdx = messages.findIndex(m => m.id === msgId);

  if (msgIdx === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  messages[msgIdx].status = 'read';
  if (writeJsonFile(MESSAGES_FILE, messages)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// Admin Endpoint: Delete a contact message (Requires Auth)
app.delete('/api/messages/:id', requireAuth, (req, res) => {
  const msgId = req.params.id;
  const messages = readJsonFile(MESSAGES_FILE);
  const updatedMessages = messages.filter(m => m.id !== msgId);

  if (messages.length === updatedMessages.length) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (writeJsonFile(MESSAGES_FILE, updatedMessages)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  Cybersecurity Portfolio Server Running  🛡️`);
  console.log(`🔗 Local Access: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
