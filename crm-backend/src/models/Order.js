const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerEmail: String,
  amount:        { type: Number, required: true },
  items:         [{ name: String, price: Number, qty: Number }],
  status:        { type: String, enum: ['completed', 'cancelled', 'refunded','pending'], default: 'completed' },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);