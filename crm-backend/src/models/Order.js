const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerEmail: String,
  amount: { type: Number, required: true },
  items: [{ name: String, price: Number, qty: Number }],
  status: { type: String, enum: ['completed', 'cancelled', 'refunded'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);