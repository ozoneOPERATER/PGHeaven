const mongoose = require('mongoose');

const OrderItem = new mongoose.Schema({
  name: String,
  qty: { type: Number, default: 1 },
  price: { type: Number, default: 0 }
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Link to a Booking when order is charged to a room
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  items: [OrderItem],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending','Processing','Delivered','Cancelled'], default: 'Pending' },
  billed: { type: Boolean, default: false },
  // Room and PG information for tracking
  roomNumber: String,
  pgName: String,
  pgLocation: String
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
