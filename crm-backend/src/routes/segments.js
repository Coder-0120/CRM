const router = require('express').Router();
const Segment = require('../models/Segment');
const { previewSegment, getAudienceForSegment } = require('../services/segmentService');

router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json(segments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, rules, logicOperator } = req.body;
    const { count } = await previewSegment(rules, logicOperator);
    const segment = await Segment.create({ name, description, rules, logicOperator, audienceSize: count });
    res.status(201).json(segment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/preview', async (req, res) => {
  try {
    const { rules, logicOperator } = req.body;
    const result = await previewSegment(rules, logicOperator);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/audience', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    const customers = await getAudienceForSegment(segment);
    res.json({ customers, count: customers.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;