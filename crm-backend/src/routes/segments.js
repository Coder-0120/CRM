const router  = require('express').Router();
const Segment = require('../models/Segment');
const auth    = require('../middleware/auth');
const { previewSegment, getAudienceForSegment } = require('../services/segmentService');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(segments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, rules, logicOperator } = req.body;
    const { count } = await previewSegment(rules, logicOperator, req.userId);
    const segment   = await Segment.create({
      userId: req.userId, name, description, rules, logicOperator, audienceSize: count
    });
    res.status(201).json(segment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/preview', async (req, res) => {
  try {
    const { rules, logicOperator } = req.body;
    const result = await previewSegment(rules, logicOperator, req.userId);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/audience', async (req, res) => {
  try {
    const segment = await Segment.findOne({ _id: req.params.id, userId: req.userId });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    const customers = await getAudienceForSegment(segment, req.userId);
    res.json({ customers, count: customers.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const segment = await Segment.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;