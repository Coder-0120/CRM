const router   = require('express').Router();
const Order    = require('../models/Order');
const Customer = require('../models/Customer');
const auth     = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { customerId, page = 1, limit = 20 } = req.query;
    const query = { userId: req.userId };
    if (customerId) query.customerId = customerId;
    const orders = await Order.find(query)
      .populate('customerId', 'name email city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ orders, total, page: Number(page) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const base = { userId: req.userId, status: 'completed' };
    const [totalOrders, totalRevenue, avgOrder] = await Promise.all([
      Order.countDocuments(base),
      Order.aggregate([{ $match: base }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Order.aggregate([{ $match: base }, { $group: { _id: null, avg:   { $avg:  '$amount' } } }])
    ]);
    res.json({
      totalOrders,
      totalRevenue:   totalRevenue[0]?.total || 0,
      avgOrderValue:  Math.round(avgOrder[0]?.avg || 0)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customerId, amount, items, status } = req.body;
    // Verify customer belongs to this user
    const customer = await Customer.findOne({ _id: customerId, userId: req.userId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const order = await Order.create({
      userId: req.userId, customerId,
      customerEmail: customer.email, amount, items, status
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalSpend: amount, visitCount: 1 },
      lastActiveDate: new Date()
    });

    res.status(201).json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const { orders } = req.body;
    const results = [];
    for (const o of orders) {
      const customer = await Customer.findOne({ email: o.customerEmail, userId: req.userId });
      if (!customer) { results.push({ skipped: o.customerEmail, reason: 'customer not found' }); continue; }
      await Order.create({
        userId: req.userId, customerId: customer._id,
        customerEmail: customer.email, amount: o.amount, status: o.status || 'completed'
      });
      await Customer.findByIdAndUpdate(customer._id, {
        $inc: { totalSpend: o.amount, visitCount: 1 }, lastActiveDate: new Date()
      });
      results.push({ created: o.customerEmail });
    }
    res.json({ success: true, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;