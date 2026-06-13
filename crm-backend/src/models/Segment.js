const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  field:    String,
  operator: String,
  value:    mongoose.Schema.Types.Mixed
}, { _id: false });

const segmentSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:          { type: String, required: true },
  description:   String,
  rules:         [ruleSchema],
  logicOperator: { type: String, enum: ['AND', 'OR'], default: 'AND' },
  audienceSize:  { type: Number, default: 0 },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Segment', segmentSchema);