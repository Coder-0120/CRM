const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:           { type: String, required: true },
  email:          { type: String, required: true },
  phone:          String,
  city:           String,
  totalSpend:     { type: Number, default: 0 },
  visitCount:     { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  tags:           [String],
  createdAt:      { type: Date, default: Date.now }
});

// email must be unique per user (not globally)
customerSchema.index({ userId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);