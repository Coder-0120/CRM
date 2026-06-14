require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const morgan   = require('morgan');

const app = express();

// ── CORS — raw headers, NO helmet at all ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  next();
});

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