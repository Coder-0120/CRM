const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');

module.exports = async (req, res) => {
  try {
    const { logId, status } = req.body;
    const log = await CommunicationLog.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    log.status = status;
    log.statusHistory.push({ status, timestamp: new Date() });
    await log.save();

    // Update campaign stats atomically
    const statField = `stats.${status}`;
    await Campaign.findByIdAndUpdate(log.campaignId, { $inc: { [statField]: 1 } });

    // Mark completed if all delivered/failed
    const campaign = await Campaign.findById(log.campaignId);
    if (campaign && (campaign.stats.delivered + campaign.stats.failed) >= campaign.stats.total) {
      await Campaign.findByIdAndUpdate(log.campaignId, { status: 'completed' });
    }

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};