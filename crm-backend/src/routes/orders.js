const router = require('express').Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  try {
    const { customerId, page = 1, limit = 20 } = req.query;
    const query = {};
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
    const [totalOrders, totalRevenue, avgOrder] = await Promise.all([
      Order.countDocuments({ status: 'completed' }),
      Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, avg: { $avg: '$amount' } } }])
    ]);
    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgOrderValue: Math.round(avgOrder[0]?.avg || 0)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customerId, amount, items, status } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const order = await Order.create({ customerId, customerEmail: customer.email, amount, items, status });

    // Update customer stats
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalSpend: amount, visitCount: 1 },
      lastActiveDate: new Date()
    });

    res.status(201).json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;