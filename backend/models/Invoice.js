const mongoose = require('mongoose');

const InvoiceItem = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  description: String,
  amount: { type: Number, default: 0 }
});

const InvoiceSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  items: [InvoiceItem],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft','Pending','Paid'], default: 'Draft' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
