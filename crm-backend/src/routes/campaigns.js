const router           = require('express').Router();
const Campaign         = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const Segment          = require('../models/Segment');
const auth             = require('../middleware/auth');
const { getAudienceForSegment } = require('../services/segmentService');
const axios            = require('axios');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.userId })
      .populate('segmentId', 'name').sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, segmentId, message, channel } = req.body;
    // Ensure segment belongs to this user
    const segment = await Segment.findOne({ _id: segmentId, userId: req.userId });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const campaign = await Campaign.create({ userId: req.userId, name, segmentId, message, channel });
    res.status(201).json(campaign);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.userId });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const segment   = await Segment.findOne({ _id: campaign.segmentId, userId: req.userId });
    if (!segment)   return res.status(404).json({ error: 'Segment not found' });

    const customers = await getAudienceForSegment(segment, req.userId);

    campaign.status      = 'sending';
    campaign.stats.total = customers.length;
    campaign.stats.sent  = customers.length;
    await campaign.save();

    const logs = customers.map(c => ({
      userId:        req.userId,
      campaignId:    campaign._id,
      customerId:    c._id,
      customerEmail: c.email,
      message:       campaign.message.replace('{{name}}', c.name).replace('{{city}}', c.city),
      channel:       campaign.channel,
      status:        'sent',
      statusHistory: [{ status: 'sent', timestamp: new Date() }]
    }));

    const savedLogs = await CommunicationLog.insertMany(logs);

    const CHANNEL_URL  = process.env.CHANNEL_SERVICE_URL;
    const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/webhook/delivery';

    savedLogs.forEach(log => {
      axios.post(`${CHANNEL_URL}/send`, {
        logId: log._id, campaignId: campaign._id,
        recipient: log.customerEmail, message: log.message,
        channel: campaign.channel, callbackUrl: CALLBACK_URL
      }).catch(err => console.error('Channel service error:', err.message));
    });

    res.json({ success: true, totalRecipients: customers.length, campaignId: campaign._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/logs', async (req, res) => {
  try {
    // Verify campaign ownership first
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.userId });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const logs = await CommunicationLog.find({ campaignId: req.params.id, userId: req.userId })
      .populate('customerId', 'name email city')
      .sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;