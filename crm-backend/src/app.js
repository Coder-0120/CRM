require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const helmet   = require('helmet');
const morgan   = require('morgan');

const app = express();

// ── CORS — BEFORE helmet, otherwise helmet strips these headers ──
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();   // .end() instead of sendStatus() for Express 5
  }
  next();
});

// ── Helmet AFTER cors, with all cross-origin policies disabled ──
app.use(helmet({
  crossOriginResourcePolicy:     { policy: 'cross-origin' },
  crossOriginOpenerPolicy:       false,
  crossOriginEmbedderPolicy:     false,
  contentSecurityPolicy:         false,
}));

app.use(express.json());
app.use((req, res, next) => { res.setTimeout(120000); next(); });
app.use(morgan('dev'));

// ── DB ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Health ──
app.get('/',       (req, res) => res.json({ status: 'ok', service: 'xeno-crm-backend', time: new Date() }));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Routes ──
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/segments',  require('./routes/segments'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/agent',     require('./routes/agent'));
app.post('/api/webhook/delivery', require('./routes/webhook'));

// ── 404 ──
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 CRM backend running on port ${PORT}`));