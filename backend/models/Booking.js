const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  roomsBooked: { type: Number, default: 1 },
  selectedRooms: [String], // Track which specific rooms are booked (e.g., ["Room 1", "Room 2"])
  status: { type: String, enum: ['Pending','Approved','Rejected','Cancelled'], default: 'Pending' },
  // Payment fields for charge-to-room / upfront payments
  amountDue: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending','Partial','Paid'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['card','upi','netbanking','offline'], default: 'offline' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  fromDate: Date,
  toDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
