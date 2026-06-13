const router = require('express').Router();
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// All customer routes require auth
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search, city, page = 1, limit = 20 } = req.query;
    const query = { userId: req.userId };
    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (city) query.city = city;
    const customers = await Customer.find(query)
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Customer.countDocuments(query);
    res.json({ customers, total, page: Number(page) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const base = { userId: req.userId };
    const total        = await Customer.countDocuments(base);
    const newThisMonth = await Customer.countDocuments({ ...base, createdAt: { $gte: new Date(new Date().setDate(1)) } });
    const highValue    = await Customer.countDocuments({ ...base, totalSpend: { $gt: 10000 } });
    const atRisk       = await Customer.countDocuments({ ...base, lastActiveDate: { $lt: new Date(Date.now() - 90 * 86400000) } });
    res.json({ total, newThisMonth, highValue, atRisk });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const { customers } = req.body;
    const results = [];
    for (const c of customers) {
      const existing = await Customer.findOne({ userId: req.userId, email: c.email });
      if (existing) {
        results.push({ skipped: c.email });
      } else {
        const created = await Customer.create({ ...c, userId: req.userId });
        results.push({ created: created.email });
      }
    }
    res.json({ success: true, results, total: results.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, userId: req.userId });
    res.status(201).json(customer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.userId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;