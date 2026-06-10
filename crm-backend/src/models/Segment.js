const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  field: String,       // totalSpend, visitCount, lastActiveDate, city, tags
  operator: String,    // gt, lt, gte, lte, eq, contains, in_last_days
  value: mongoose.Schema.Types.Mixed
}, { _id: false });

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  rules: [ruleSchema],
  logicOperator: { type: String, enum: ['AND', 'OR'], default: 'AND' },
  audienceSize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Segment', segmentSchema);