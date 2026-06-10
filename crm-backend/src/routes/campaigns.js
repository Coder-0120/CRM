const router = require('express').Router();
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const Segment = require('../models/Segment');
const { getAudienceForSegment } = require('../services/segmentService');
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('segmentId', 'name').sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, segmentId, message, channel } = req.body;
    const campaign = await Campaign.create({ name, segmentId, message, channel });
    res.status(201).json(campaign);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const segment = await Segment.findById(campaign.segmentId);
    const customers = await getAudienceForSegment(segment);

    campaign.status = 'sending';
    campaign.stats.total = customers.length;
    campaign.stats.sent = customers.length;
    await campaign.save();

    const logs = customers.map(c => ({
      campaignId: campaign._id,
      customerId: c._id,
      customerEmail: c.email,
      message: campaign.message.replace('{{name}}', c.name).replace('{{city}}', c.city),
      channel: campaign.channel,
      status: 'sent',
      statusHistory: [{ status: 'sent', timestamp: new Date() }]
    }));

    const savedLogs = await CommunicationLog.insertMany(logs);

    // Fire and forget — send to channel service
    const CHANNEL_URL = process.env.CHANNEL_SERVICE_URL;
    const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/webhook/delivery';

    savedLogs.forEach(log => {
      axios.post(`${CHANNEL_URL}/send`, {
        logId: log._id,
        campaignId: campaign._id,
        recipient: log.customerEmail,
        message: log.message,
        channel: campaign.channel,
        callbackUrl: CALLBACK_URL
      }).catch(err => console.error('Channel service error:', err.message));
    });

    res.json({ success: true, totalRecipients: customers.length, campaignId: campaign._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ campaignId: req.params.id })
      .populate('customerId', 'name email city')
      .sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;