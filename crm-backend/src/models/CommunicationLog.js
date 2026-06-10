const mongoose = require('mongoose');

const commLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerEmail: String,
  message: String,
  channel: String,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'opened', 'clicked'],
    default: 'sent'
  },
  statusHistory: [{ status: String, timestamp: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunicationLog', commLogSchema);