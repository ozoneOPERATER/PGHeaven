const PG = require('../models/PG');
const mongoose = require('mongoose');

exports.createPG = async (req, res) => {
  try {
    console.log('--- createPG Request ---');
    const data = req.body;
    console.log('Incoming Data:', data);
    console.log('Uploaded Files:', req.files);

    if (req.files && req.files.length) data.images = req.files.map(f => f.path.replace(/\\/g, '/'));
    // Ensure `totalRooms` is set (fall back to legacy `availableRooms` if provided)
    if (data.totalRooms == null && data.availableRooms != null) data.totalRooms = data.availableRooms;

    console.log('Data to insert:', data);
    const pg = await PG.create(data);
    res.json(pg);
  } catch (err) {
    console.error('Error creating PG:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePG = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (req.files && req.files.length) data.images = req.files.map(f => f.path.replace(/\\/g, '/'));
    const pg = await PG.findByIdAndUpdate(id, data, { new: true });
    res.json(pg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deletePG = async (req, res) => {
  try { await PG.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPGs = async (req, res) => {
  try {
    const { minPrice, maxPrice, location, q, page = 1, limit = 12 } = req.query;
    const { fromDate, toDate } = req.query;
    const filter = {};
    if (location) filter.location = new RegExp(location, 'i');
    if (q) filter.name = new RegExp(q, 'i');
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await PG.countDocuments(filter);
    let pgs = await PG.find(filter).populate('ratings.user', 'name').skip(skip).limit(Number(limit));
    // If date range provided, compute availability per PG
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const Booking = require('../models/Booking');
      pgs = await Promise.all(pgs.map(async (pg) => {
        const overlapping = await Booking.find({
          pg: pg._id,
          status: { $ne: 'Cancelled' },
          $or: [{ fromDate: { $lte: to }, toDate: { $gte: from } }]
        });
        const booked = overlapping.reduce((s, b) => s + (b.roomsBooked || 1), 0);
        const total = (pg.totalRooms || pg.availableRooms || 1);
        const available = Math.max(0, total - booked);
        const obj = pg.toObject();
        obj.availableRooms = available;
        return obj;
      }));
    }
    res.json({ total, page: Number(page), pgs });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPGById = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id).populate('ratings.user', 'name');
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    const { fromDate, toDate } = req.query;
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const Booking = require('../models/Booking');
      const overlapping = await Booking.find({
        pg: pg._id,
        status: { $ne: 'Cancelled' },
        $or: [{ fromDate: { $lte: to }, toDate: { $gte: from } }]
      });
      const booked = overlapping.reduce((s, b) => s + (b.roomsBooked || 1), 0);
      const total = (pg.totalRooms || pg.availableRooms || 1);
      const obj = pg.toObject();
      obj.availableRooms = Math.max(0, total - booked);
      return res.json(obj);
    }
    res.json(pg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await PG.countDocuments();
    const pgs = await PG.find({}, 'ratings');

    let totalRatings = 0;
    let sumRatings = 0;
    pgs.forEach(pg => {
      totalRatings += pg.ratings.length;
      sumRatings += pg.ratings.reduce((s, r) => s + r.rating, 0);
    });

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Get user statistics
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Get booking statistics
    const Booking = require('../models/Booking');
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });

    res.json({
      total,
      averageRating: averageRating.toFixed(1),
      totalRatings,
      totalUsers,
      newUsers,
      totalBookings,
      pendingBookings
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.ratePG = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;
    console.log('Rating request:', { id, rating, review, userId });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    const mongoose = require('mongoose');
    console.log('userId valid ObjectId:', mongoose.Types.ObjectId.isValid(userId));
    const pg = await PG.findById(id);
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    // Clean invalid ratings (e.g., empty strings from corrupted data)
    pg.ratings = pg.ratings.filter(r => r && typeof r === 'object' && r.user);
    // Check if user already rated
    const existing = pg.ratings.find(r => r.user && r.user.toString() === userId);
    console.log('Existing rating:', existing);
    if (existing) {
      existing.rating = rating;
      existing.review = review;
    } else {
      pg.ratings.push({ user: userId, rating, review });
    }
    // Recalculate average
    const total = pg.ratings.reduce((sum, r) => sum + r.rating, 0);
    pg.averageRating = pg.ratings.length > 0 ? total / pg.ratings.length : 0;
    console.log('Saving PG with ratings:', pg.ratings);
    await pg.save();
    // Populate user names for response
    await pg.populate('ratings.user', 'name');
    res.json(pg);
  } catch (err) {
    console.error('Error in ratePG:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserRatings = async (req, res) => {
  try {
    console.log('getUserRatings called for user', req.user && req.user.id);
    if (!req.user || !req.user.id) return res.json([]);
    // Basic safe implementation: try to fetch ratings but return empty list on errors
    try {
      const userId = req.user.id;
      const pgs = await PG.find({ 'ratings.user': userId }).populate('ratings.user', 'name');
      const userRatings = [];
      pgs.forEach(pg => {
        const rating = pg.ratings && pg.ratings.find(r => {
          if (!r || !r.user) return false;
          const uid = (typeof r.user === 'object' && r.user._id) ? r.user._id.toString() : r.user.toString();
          return uid === userId;
        });
        if (rating) {
          userRatings.push({ pg: { _id: pg._id, name: pg.name, location: pg.location }, rating: rating.rating, review: rating.review, createdAt: rating.createdAt });
        }
      });
      return res.json(userRatings);
    } catch (inner) {
      console.error('getUserRatings inner error:', inner && inner.message);
      return res.json([]);
    }
  } catch (err) {
    console.error('getUserRatings fatal error:', err && err.message);
    return res.json([]);
  }
};
