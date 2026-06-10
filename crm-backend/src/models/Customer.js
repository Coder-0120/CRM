const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  city: String,
  totalSpend: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);