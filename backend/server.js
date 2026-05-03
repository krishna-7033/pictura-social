const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const tenantResolver = require('./middleware/tenantResolver');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const parseCorsOrigins = () => {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw.trim() === '*') return '*';
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
};

// Middleware
app.use(cors({ origin: parseCorsOrigins(), credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(tenantResolver);

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, service: 'backend', ts: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram-clone')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
// Tenant creation and management
app.use('/api/tenants', require('./routes/tenants'));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
