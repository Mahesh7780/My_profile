require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');

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
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));
}

// Schemas
const MessageSchema = new mongoose.Schema({
  id: String, name: String, email: String, inquiry: String, message: String, company: String, timestamp: String, status: String
});
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const ChangeSchema = new mongoose.Schema({
  id: String, type: String, section: String, description: String, content: mongoose.Schema.Types.Mixed, oldContent: mongoose.Schema.Types.Mixed, elementId: String, status: String, timestamp: String, approvedAt: String, rejectedAt: String
});
const Change = mongoose.models.Change || mongoose.model('Change', ChangeSchema);

const PortfolioSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },
  data: mongoose.Schema.Types.Mixed
});
const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);

app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === `Bearer ${AUTH_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
};

// Data Helpers
async function getPortfolioData() {
  if (MONGO_URI) {
    const port = await Portfolio.findOne({ key: 'main' });
    return port ? port.data : readJsonFile(PORTFOLIO_FILE, {});
  }
  return readJsonFile(PORTFOLIO_FILE, {});
}
async function savePortfolioData(data) {
  if (MONGO_URI) {
    await Portfolio.findOneAndUpdate({ key: 'main' }, { data }, { upsert: true });
    return true;
  }
  return writeJsonFile(PORTFOLIO_FILE, data);
}

async function getChangesData() {
  if (MONGO_URI) return await Change.find({});
  return readJsonFile(CHANGES_FILE, []);
}
async function saveChangeData(change) {
  if (MONGO_URI) {
    await new Change(change).save();
    return true;
  }
  const changes = readJsonFile(CHANGES_FILE, []);
  changes.push(change);
  return writeJsonFile(CHANGES_FILE, changes);
}

async function getMessagesData() {
  if (MONGO_URI) return await Message.find({});
  return readJsonFile(MESSAGES_FILE, []);
}
async function saveMessageData(msg) {
  if (MONGO_URI) {
    await new Message(msg).save();
    return true;
  }
  const messages = readJsonFile(MESSAGES_FILE, []);
  messages.push(msg);
  return writeJsonFile(MESSAGES_FILE, messages);
}

// Endpoints
app.get('/api/portfolio', async (req, res) => {
  const data = await getPortfolioData();
  res.json(data);
});

app.post('/api/contact', async (req, res) => {
  const { name, email, inquiry, message, company } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

  const newMessage = {
    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
    name, email, inquiry, message, company: company || '',
    timestamp: new Date().toISOString(), status: 'unread'
  };

  const success = await saveMessageData(newMessage);
  if (success) res.json({ success: true, message: 'Message sent successfully' });
  else res.status(500).json({ error: 'Failed to save message' });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) res.json({ success: true, token: AUTH_TOKEN });
  else res.status(401).json({ error: 'Invalid password' });
});

app.post('/api/admin/resume', requireAuth, upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, message: 'Resume uploaded successfully', path: '/assets/resume.pdf' });
});

app.post('/api/portfolio/propose', requireAuth, async (req, res) => {
  const { type, section, description, content, oldContent, elementId } = req.body;
  if (!type || !section || !content) return res.status(400).json({ error: 'Missing required change details' });

  const newChange = {
    id: 'chg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    type, section, description: description || `Update ${section}`,
    content, oldContent: oldContent || null, elementId: elementId || null,
    status: 'pending', timestamp: new Date().toISOString()
  };

  const success = await saveChangeData(newChange);
  if (success) res.json({ success: true, change: newChange });
  else res.status(500).json({ error: 'Failed to record change proposal' });
});

app.get('/api/portfolio/changes', requireAuth, async (req, res) => {
  const changes = await getChangesData();
  res.json(changes);
});

app.post('/api/portfolio/changes/:id/approve', requireAuth, async (req, res) => {
  const changeId = req.params.id;
  
  if (MONGO_URI) {
    const change = await Change.findOne({ id: changeId });
    if (!change) return res.status(404).json({ error: 'Change proposal not found' });
    if (change.status !== 'pending') return res.status(400).json({ error: `Change already ${change.status}` });

    const portfolio = await getPortfolioData();
    const section = change.section;
    if (section === 'about' || section === 'hero' || section === 'experience') portfolio[section] = change.content;
    else if (section === 'skills') portfolio.skills = change.content;
    else if (section === 'projects') portfolio.projects = change.content;
    else if (section === 'certifications') portfolio.certifications = change.content;
    else return res.status(400).json({ error: `Unknown section: ${section}` });

    change.status = 'approved';
    change.approvedAt = new Date().toISOString();
    await change.save();
    await savePortfolioData(portfolio);
    return res.json({ success: true, message: 'Change approved and applied successfully' });
  } else {
    // Local File fallback logic
    const changes = readJsonFile(CHANGES_FILE);
    const changeIdx = changes.findIndex(c => c.id === changeId);
    if (changeIdx === -1) return res.status(404).json({ error: 'Change proposal not found' });
    const change = changes[changeIdx];
    if (change.status !== 'pending') return res.status(400).json({ error: `Change already ${change.status}` });

    const portfolio = readJsonFile(PORTFOLIO_FILE, {});
    const section = change.section;
    if (section === 'about' || section === 'hero' || section === 'experience') portfolio[section] = change.content;
    else if (section === 'skills') portfolio.skills = change.content;
    else if (section === 'projects') portfolio.projects = change.content;
    else if (section === 'certifications') portfolio.certifications = change.content;
    else return res.status(400).json({ error: `Unknown section: ${section}` });

    change.status = 'approved';
    change.approvedAt = new Date().toISOString();
    const savedPortfolio = writeJsonFile(PORTFOLIO_FILE, portfolio);
    const savedChanges = writeJsonFile(CHANGES_FILE, changes);
    if (savedPortfolio && savedChanges) res.json({ success: true, message: 'Change approved and applied successfully' });
    else res.status(500).json({ error: 'Failed to apply approval updates' });
  }
});

app.post('/api/portfolio/changes/:id/reject', requireAuth, async (req, res) => {
  const changeId = req.params.id;
  if (MONGO_URI) {
    const change = await Change.findOne({ id: changeId });
    if (!change) return res.status(404).json({ error: 'Change proposal not found' });
    if (change.status !== 'pending') return res.status(400).json({ error: `Change already ${change.status}` });
    change.status = 'rejected';
    change.rejectedAt = new Date().toISOString();
    await change.save();
    return res.json({ success: true, message: 'Change rejected and discarded' });
  } else {
    const changes = readJsonFile(CHANGES_FILE);
    const changeIdx = changes.findIndex(c => c.id === changeId);
    if (changeIdx === -1) return res.status(404).json({ error: 'Change proposal not found' });
    const change = changes[changeIdx];
    if (change.status !== 'pending') return res.status(400).json({ error: `Change already ${change.status}` });
    change.status = 'rejected';
    change.rejectedAt = new Date().toISOString();
    if (writeJsonFile(CHANGES_FILE, changes)) res.json({ success: true, message: 'Change rejected and discarded' });
    else res.status(500).json({ error: 'Failed to update change rejection status' });
  }
});

app.get('/api/messages', requireAuth, async (req, res) => {
  const messages = await getMessagesData();
  res.json(messages);
});

app.post('/api/messages/:id/read', requireAuth, async (req, res) => {
  const msgId = req.params.id;
  if (MONGO_URI) {
    const msg = await Message.findOne({ id: msgId });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    msg.status = 'read';
    await msg.save();
    return res.json({ success: true });
  } else {
    const messages = readJsonFile(MESSAGES_FILE);
    const msgIdx = messages.findIndex(m => m.id === msgId);
    if (msgIdx === -1) return res.status(404).json({ error: 'Message not found' });
    messages[msgIdx].status = 'read';
    if (writeJsonFile(MESSAGES_FILE, messages)) res.json({ success: true });
    else res.status(500).json({ error: 'Failed to update message status' });
  }
});

app.delete('/api/messages/:id', requireAuth, async (req, res) => {
  const msgId = req.params.id;
  if (MONGO_URI) {
    const result = await Message.deleteOne({ id: msgId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Message not found' });
    return res.json({ success: true });
  } else {
    const messages = readJsonFile(MESSAGES_FILE);
    const updatedMessages = messages.filter(m => m.id !== msgId);
    if (messages.length === updatedMessages.length) return res.status(404).json({ error: 'Message not found' });
    if (writeJsonFile(MESSAGES_FILE, updatedMessages)) res.json({ success: true });
    else res.status(500).json({ error: 'Failed to delete message' });
  }
});

// For Vercel Serverless Function export
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  Cybersecurity Portfolio Server Running  🛡️`);
    console.log(`🔗 Local Access: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}
