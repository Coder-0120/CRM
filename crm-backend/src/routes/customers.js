const router = require('express').Router();
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  try {
    const { search, city, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (city) query.city = city;
    const customers = await Customer.find(query).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Customer.countDocuments(query);
    res.json({ customers, total, page: Number(page) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const newThisMonth = await Customer.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } });
    const highValue = await Customer.countDocuments({ totalSpend: { $gt: 10000 } });
    const atRisk = await Customer.countDocuments({ lastActiveDate: { $lt: new Date(Date.now() - 90 * 86400000) } });
    res.json({ total, newThisMonth, highValue, atRisk });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const { customers } = req.body;
    const results = [];
    for (const c of customers) {
      const existing = await Customer.findOne({ email: c.email });
      if (existing) {
        results.push({ skipped: c.email });
      } else {
        const created = await Customer.create(c);
        results.push({ created: created.email });
      }
    }
    res.json({ success: true, results, total: results.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;