require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const app = express();

// ── CORS — must come BEFORE helmet and all routes ──
app.use(cors({
  origin: true,          // reflect the request origin — allows any origin
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));

// Handle OPTIONS preflight for every route
app.options(/(.*)/, cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));
app.use(express.json());
app.use((req, res, next) => { res.setTimeout(120000); next(); });
app.use(morgan('dev'));

// ── DB ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Health / root ──
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