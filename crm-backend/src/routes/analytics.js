const router = require('express').Router();
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');

router.get('/overview', async (req, res) => {
  try {
    const [totalCustomers, totalCampaigns, logs] = await Promise.all([
      Customer.countDocuments(),
      Campaign.countDocuments(),
      CommunicationLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    const statusMap = {};
    logs.forEach(l => statusMap[l._id] = l.count);
    res.json({ totalCustomers, totalCampaigns, ...statusMap });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'completed' })
      .select('name stats createdAt').sort({ createdAt: -1 }).limit(10);
    res.json(campaigns);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;