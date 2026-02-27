const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
  type: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ['Pending','InProgress','Completed','Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
