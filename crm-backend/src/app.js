require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const app = express();

// ── CORS ── allow any origin in production so Vercel frontend works
// (scope this down to FRONTEND_URL once confirmed working)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow your Vercel frontend
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    // During development / debugging allow all origins — remove in prod if needed
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    // In production, still allow (you can tighten this later)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // handle preflight for all routes (Express 5 syntax)
app.use(express.json());
app.use((req, res, next) => { res.setTimeout(120000); next(); });
app.use(morgan('dev'));

// ── DB connection ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Health check (root + /health) ──
app.get('/', (req, res) => res.json({ status: 'ok', service: 'xeno-crm-backend', time: new Date() }));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Routes ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/customers',require('./routes/customers'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/segments', require('./routes/segments'));
app.use('/api/campaigns',require('./routes/campaigns'));
app.use('/api/analytics',require('./routes/analytics'));
app.use('/api/agent',    require('./routes/agent'));
app.post('/api/webhook/delivery', require('./routes/webhook'));

// ── 404 catch-all ──
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 CRM backend running on port ${PORT}`));