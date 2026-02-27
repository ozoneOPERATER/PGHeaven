const mongoose = require('mongoose');

const PGSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  images: [String],
  // `totalRooms` is the canonical room count. `availableRooms` is kept for
  // backward-compatibility but should not be mutated; availability is
  // computed from bookings when needed.
  totalRooms: { type: Number, default: 1 },
  availableRooms: { type: Number, default: 1 },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  // Default food charge per room per day (optional)
  defaultFoodPerRoom: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PG', PGSchema);
