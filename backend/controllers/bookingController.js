const Booking = require('../models/Booking');
const PG = require('../models/PG');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

// Helper: Get available rooms for a PG during a date range
const getAvailableRooms = async (pgId, fromDate, toDate) => {
  const pg = await PG.findById(pgId);
  if (!pg) throw new Error('PG not found');

  const from = new Date(fromDate);
  const to = new Date(toDate);

  // Find overlapping bookings.  Use the same strict comparison as createBooking so that
  // a room freed on the same day another reservation starts is not considered booked.
  const overlapping = await Booking.find({
    pg: pgId,
    status: { $ne: 'Cancelled' },
    fromDate: { $lt: to },
    toDate: { $gt: from }
  });

  const totalRooms = pg.totalRooms || pg.availableRooms || 1;
  const bookedRooms = new Set();

  // Collect all booked room numbers
  overlapping.forEach(booking => {
    if (booking.selectedRooms && booking.selectedRooms.length > 0) {
      booking.selectedRooms.forEach(room => bookedRooms.add(room));
    }
  });

  // Generate available room list
  const allRooms = Array.from({ length: totalRooms }, (_, i) => `Room ${i + 1}`);
  const availableRooms = allRooms.filter(room => !bookedRooms.has(room));

  return {
    totalRooms,
    availableCount: availableRooms.length,
    availableRooms,
    bookedRooms: Array.from(bookedRooms),
    allRooms
  };
};

// Helper: Auto-assign rooms from available pool
const autoAssignRooms = (availableRooms, roomsToBook) => {
  const roomsNeeded = Math.min(roomsToBook, availableRooms.length);
  if (roomsNeeded < roomsToBook) {
    throw new Error(`Not enough available rooms. Requested: ${roomsToBook}, Available: ${roomsNeeded}`);
  }
  return availableRooms.slice(0, roomsNeeded);
};

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pgId, roomsBooked, fromDate, toDate, selectedRooms } = req.body;
    const pg = await PG.findById(pgId);
    if (!pg) return res.status(404).json({ message: 'PG not found' });

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from) || isNaN(to) || from > to) return res.status(400).json({ message: 'Invalid date range' });

    // Prevent duplicate/overlapping active bookings for the same user and PG
    // NOTE: we treat bookings that end exactly when a new one begins as non‑overlapping so
    // that a user can make back‑to‑back reservations.  Only bookings with a true date range
    // intersection will be considered conflicting.
    const existingBooking = await Booking.findOne({
      user: userId,
      pg: pgId,
      status: { $in: ['Approved', 'Pending'] },
      // overlap occurs when the existing booking starts before the new booking ends
      // and the existing booking ends after the new booking starts.
      fromDate: { $lt: to },
      toDate: { $gt: from }
    });
    if (existingBooking) {
      // include simple info to help debugging if multiple bookings are being attempted
      return res.status(400).json({
        message: 'You already have an active booking for this property during this period. Please cancel it first.',
        existing: {
          fromDate: existingBooking.fromDate,
          toDate: existingBooking.toDate,
          status: existingBooking.status
        }
      });
    }

    const roomCount = roomsBooked || 1;

    // Get available rooms
    const availability = await getAvailableRooms(pgId, from, to);

    let assignedRooms = selectedRooms || [];

    // If specific rooms provided, validate they're available
    if (assignedRooms.length > 0) {
      for (const room of assignedRooms) {
        if (!availability.availableRooms.includes(room)) {
          return res.status(400).json({
            message: `${room} is not available for the selected dates. Available: ${availability.availableRooms.join(', ')}`
          });
        }
      }
    } else {
      // Auto-assign rooms from available pool
      try {
        assignedRooms = autoAssignRooms(availability.availableRooms, roomCount);
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // Calculate duration in days
    const durationMs = to - from;
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Calculate room charge: PG price * roomsBooked * days
    const roomCharge = (pg.price || 0) * roomCount * days;

    const booking = await Booking.create({
      user: userId,
      pg: pgId,
      roomsBooked: roomCount,
      selectedRooms: assignedRooms,
      fromDate: from,
      toDate: to,
      amountDue: roomCharge,
      paymentStatus: 'Pending'
    });

    // Populate before response
    await booking.populate('pg');

    res.json({
      booking,
      assignedRooms,
      roomCharge,
      message: `Booking created. Auto-assigned rooms: ${assignedRooms.join(', ')}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('pg');

    // Enhance with room details
    const enrichedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      roomDetails: {
        assignedRooms: booking.selectedRooms || [],
        roomCount: (booking.selectedRooms && booking.selectedRooms.length) || booking.roomsBooked || 1,
        pgName: booking.pg?.name,
        pgLocation: booking.pg?.location
      }
    }));

    res.json(enrichedBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('pg');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify user is the owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const enriched = {
      ...booking.toObject(),
      roomDetails: {
        assignedRooms: booking.selectedRooms || [],
        roomCount: (booking.selectedRooms && booking.selectedRooms.length) || booking.roomsBooked || 1,
        pgName: booking.pg?.name,
        pgLocation: booking.pg?.location,
        price: booking.pg?.price
      }
    };

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('pg').populate('user', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { pgId, fromDate, toDate } = req.query;
    if (!pgId || !fromDate || !toDate) {
      return res.status(400).json({ message: 'pgId, fromDate, and toDate are required' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from) || isNaN(to) || from > to) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const availability = await getAvailableRooms(pgId, from, to);

    res.json({
      success: true,
      totalRooms: availability.totalRooms,
      availableCount: availability.availableCount,
      availableRooms: availability.availableRooms,
      bookedRooms: availability.bookedRooms,
      allRooms: availability.allRooms
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findById(id).populate('pg').populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const pg = await PG.findById(booking.pg._id);
    const oldStatus = booking.status;

    // Approving a Pending booking
    if (status === 'Approved' && oldStatus !== 'Approved') {
      const roomsNeeded = booking.roomsBooked || 1;

      const availability = await getAvailableRooms(pg._id, booking.fromDate, booking.toDate);

      if (availability.availableCount < roomsNeeded) {
        return res.status(400).json({ message: 'Not enough available rooms for these dates' });
      }

      // Auto-assign rooms
      const assigned = autoAssignRooms(availability.availableRooms, roomsNeeded);

      booking.selectedRooms = assigned;
      booking.status = 'Approved';

      // Update basic tracking count on PG
      if (typeof pg.availableRooms === 'number') {
        pg.availableRooms = Math.max(0, pg.availableRooms - roomsNeeded);
        await pg.save();
      }

      await booking.save();
      return res.json({ booking, assignedRooms: assigned, message: 'Booking approved' });
    }

    // Changing an Approved booking to Rejected/Cancelled (Restore rooms)
    if (oldStatus === 'Approved' && (status === 'Rejected' || status === 'Cancelled')) {
      // Restore simple room count
      if (typeof pg.availableRooms === 'number') {
        const maxRooms = pg.totalRooms || 1;
        pg.availableRooms = Math.min(maxRooms, pg.availableRooms + (booking.roomsBooked || 1));
        await pg.save();
      }
    }

    // Other status updates
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only booking owner can cancel
    if (!booking.user || booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to cancel this booking' });

    if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'Cancelled';
    await booking.save();

    // We no longer mutate PG.availableRooms on cancel — availability is
    // determined by counting active bookings against `totalRooms`.
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin utility: manually restore rooms associated with a booking
exports.releaseRooms = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.roomsReleased) {
      return res.status(400).json({ message: 'Rooms already released for this booking' });
    }

    const pg = await PG.findById(booking.pg);
    if (!pg) return res.status(404).json({ message: 'PG not found' });

    const rooms = booking.roomsBooked || 1;
    const maxRooms = pg.totalRooms || 1;
    if (typeof pg.availableRooms === 'number') {
      pg.availableRooms = Math.min(maxRooms, pg.availableRooms + rooms);
      await pg.save();
    }

    // free up the specific room numbers so availability calculations ignore them
    booking.selectedRooms = [];
    booking.roomsBooked = 0;

    booking.roomsReleased = true;
    await booking.save();

    res.json({ booking, pg, message: `${rooms} room(s) added back to ${pg.name}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearFoodNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    booking.foodNotified = false;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    // Recompute authoritative amounts on server to avoid client-side manipulation or legacy incorrect values
    const { amountPaid: incomingAmountPaid = 0, paymentMethod } = req.body;
    const booking = await Booking.findById(id).populate('pg').populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Compute room charge (per day)
    const pgPrice = (booking.pg && booking.pg.price) ? Number(booking.pg.price) : 0;
    const durationMs = new Date(booking.toDate) - new Date(booking.fromDate);
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    const roomCharge = pgPrice * (booking.roomsBooked || 1) * days;

    // Sum any unbilled orders for this booking
    const Order = require('../models/Order');
    const orders = await Order.find({ booking: booking._id, billed: false });
    const foodTotal = orders.reduce((s, o) => s + (o.total || 0), 0);

    const authoritativeDue = roomCharge + foodTotal;

    // Determine how much new payment is being added and accumulate with previous payments
    const previousPaid = booking.amountPaid || 0;
    let paid = previousPaid + (Number(incomingAmountPaid) || 0);
    if (paid > authoritativeDue) paid = authoritativeDue;

    booking.amountPaid = paid;
    booking.amountDue = Math.max(0, authoritativeDue - paid);
    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    booking.paymentStatus = paid >= authoritativeDue ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending');
    booking.updatedAt = new Date();
    await booking.save();

    // If fully paid, mark orders billed
    if (paid >= authoritativeDue && orders.length) {
      await Order.updateMany({ _id: { $in: orders.map(o => o._id) } }, { billed: true });
    }

    const refreshed = await Booking.findById(id).populate('pg').populate('user', 'name email');
    res.json(refreshed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Checkout: compute invoice for unbilled orders + per-room food charge and optionally accept payment
exports.checkoutBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('pg').populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only owner can checkout (or admin)
    const bookingUserId = booking.user ? (booking.user._id ? booking.user._id.toString() : booking.user.toString()) : null;
    if (!bookingUserId || (bookingUserId !== req.user.id && req.user.role !== 'admin')) return res.status(403).json({ message: 'Not authorized' });

    const Order = require('../models/Order');
    const Invoice = require('../models/Invoice');
    const orders = await Order.find({ booking: booking._id, billed: false });

    // Calculate duration in days
    const durationMs = new Date(booking.toDate) - new Date(booking.fromDate);
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Calculate room charge: PG price * roomsBooked * days
    const pgPrice = (booking.pg && booking.pg.price) ? Number(booking.pg.price) : 0;
    const roomCharge = pgPrice * (booking.roomsBooked || 1) * days;

    // Build invoice items: show room due in a way that accounts for any previous payment,
    // and add a descriptive line if the room has already been paid for or partially paid.
    const items = [];
    const previousPaid = booking.amountPaid || 0;
    const roomDue = Math.max(0, roomCharge - previousPaid);

    if (previousPaid >= roomCharge) {
      // fully paid room, still include a line for clarity but with zero amount
      items.push({ description: `Room charges (already paid) - ${booking.roomsBooked || 1} room(s)`, amount: 0 });
    } else {
      let desc = `Room charges (${booking.roomsBooked} room(s) @ ₹${pgPrice}/day for ${days} days)`;
      if (previousPaid > 0) {
        desc += ` (₹${previousPaid} already paid)`;
      }
      items.push({ description: desc, amount: roomDue });
    }

    // Add food orders with menu item details and calculate total food charge
    let foodTotal = 0;
    orders.forEach(o => {
      const orderAmount = o.total || 0;
      foodTotal += orderAmount;
      if (orderAmount > 0) {
        const itemsList = (o.items || []).map(it => `${it.name || 'Item'} × ${it.qty || 1}`).join(', ');
        const itemsDesc = itemsList || `Order`;
        items.push({ order: o._id, description: `Food: ${itemsDesc} (₹${orderAmount})`, amount: orderAmount });
      }
    });

    const total = roomDue + foodTotal;

    // Accept optional payment payload: { amount, method }
    const payment = req.body && req.body.payment ? req.body.payment : null;
    let invoiceStatus = 'Pending';
    let paidAmount = 0;
    if (payment && payment.amount) {
      paidAmount = Number(payment.amount) || 0;
      // Invoice model only allows 'Draft','Pending','Paid'. Use 'Pending' for partial payments.
      invoiceStatus = paidAmount >= total ? 'Paid' : 'Pending';
    }
    // if there's no payment payload, leave paidAmount at 0 so we just render the invoice

    const invoiceData = {
      booking: booking._id,
      orders: orders.map(o => o._id),
      items,
      total,
      status: invoiceStatus,
    };
    if (payment) {
      invoiceData.paid = paidAmount;
      invoiceData.paymentMethod = payment.method || 'offline';
    }

    const invoice = await Invoice.create(invoiceData);

    // If fully paid now, mark orders billed
    if (paidAmount >= total) {
      if (orders.length) await Order.updateMany({ _id: { $in: orders.map(o => o._id) } }, { billed: true });
    }

    // Update booking amounts and status.  amountDue should reflect remaining balance
    const previousPaidTotal = booking.amountPaid || 0;
    booking.amountDue = Math.max(0, roomCharge + foodTotal - previousPaidTotal - paidAmount);

    if (paidAmount > 0) {
      // accumulate payments rather than overwrite
      booking.amountPaid = previousPaidTotal + paidAmount;
    }

    const overallTotal = roomCharge + foodTotal;
    if (booking.amountPaid >= overallTotal) {
      booking.paymentStatus = 'Paid';
    } else if (booking.amountPaid > 0) {
      booking.paymentStatus = 'Partial';
    } else {
      booking.paymentStatus = 'Pending';
    }

    await booking.save();

    res.json({
      invoice,
      booking,
      customer: {
        name: booking.user?.name,
        email: booking.user?.email
      },
      roomNumber: booking.selectedRooms?.join(', ') || 'Not assigned'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
