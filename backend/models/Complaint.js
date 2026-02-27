const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Open','InProgress','Resolved','Closed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
