const Order = require('../models/Order');
const Booking = require('../models/Booking');

exports.createOrder = async (req, res) => {
  try {
    const { bookingId, items, roomNumber } = req.body;
    const data = { 
      user: req.user.id,
      items: items || [],
      booking: bookingId || undefined,
      roomNumber: roomNumber || undefined
    };
    
    // Compute total if not provided
    if (!req.body.total && data.items && data.items.length) {
      data.total = data.items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
    } else {
      data.total = req.body.total || 0;
    }

    // If booking provided, fetch booking details and enrich order with room info
    if (bookingId) {
      const booking = await Booking.findById(bookingId).populate('pg');
      if (booking && booking.selectedRooms && booking.selectedRooms.length > 0) {
        // If room number not specified, use first assigned room
        data.roomNumber = roomNumber || booking.selectedRooms[0];
        data.pgName = booking.pg?.name;
        data.pgLocation = booking.pg?.location;
      }
    }

    const order = await Order.create(data);
    
    // Populate reference data
    await order.populate('booking');

    // If order attached to a booking and a roomNumber was used, remove that room
    // from the booking.selectedRooms to mark it as handled
    if (bookingId && data.roomNumber) {
      try {
        const bookingToUpdate = await Booking.findById(bookingId);
        if (bookingToUpdate && Array.isArray(bookingToUpdate.selectedRooms)) {
          bookingToUpdate.selectedRooms = bookingToUpdate.selectedRooms.filter(r => r !== data.roomNumber);
          await bookingToUpdate.save();
        }
      } catch (e) {
        // Don't block order creation if booking update fails; log error to console
        console.error('Failed to update booking selectedRooms after order:', e.message || e);
      }
    }

    res.json({
      order,
      message: `Order created for room: ${data.roomNumber || 'N/A'}`
    });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

exports.createOrderForBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId).populate('pg');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user is booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { items, roomNumber } = req.body;
    const data = { 
      user: req.user.id, 
      booking: bookingId,
      items: items || [],
      roomNumber: roomNumber || (booking.selectedRooms && booking.selectedRooms[0]) || undefined
    };
    
    // Compute total
    if (!req.body.total && data.items && data.items.length) {
      data.total = data.items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
    } else {
      data.total = req.body.total || 0;
    }

    // Add PG details
    if (booking.pg) {
      data.pgName = booking.pg.name;
      data.pgLocation = booking.pg.location;
    }

    const order = await Order.create(data);
    await order.populate('booking');

    // Remove the room from booking.selectedRooms so it won't be shown again
    if (booking && data.roomNumber && Array.isArray(booking.selectedRooms)) {
      try {
        booking.selectedRooms = booking.selectedRooms.filter(r => r !== data.roomNumber);
        await booking.save();
      } catch (e) {
        console.error('Failed to remove room from booking.selectedRooms:', e.message || e);
      }
    }

    res.json({
      order,
      roomNumber: data.roomNumber,
      pgName: data.pgName,
      message: `Food order created for room: ${data.roomNumber || 'N/A'} at ${data.pgName}`
    });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

exports.getUserOrders = async (req, res) => {
  try { 
    const orders = await Order.find({ user: req.user.id }).populate('booking').sort({ createdAt: -1 });
    
    // Enrich with room details
    const enrichedOrders = orders.map(order => ({
      ...order.toObject(),
      roomInfo: {
        roomNumber: order.roomNumber,
        pgName: order.pgName,
        pgLocation: order.pgLocation,
        bookingId: order.booking?._id
      }
    }));
    
    res.json(enrichedOrders); 
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

exports.getAllOrders = async (req, res) => {
  try { 
    const orders = await Order.find().populate('user','name email').populate('booking').sort({ createdAt: -1 });
    
    // Enrich with room details for admin view
    const enrichedOrders = orders.map(order => ({
      ...order.toObject(),
      roomInfo: {
        roomNumber: order.roomNumber,
        pgName: order.pgName,
        pgLocation: order.pgLocation,
        bookingId: order.booking?._id
      }
    }));
    
    res.json(enrichedOrders); 
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

exports.getOrdersByRoom = async (req, res) => {
  try {
    const { bookingId, roomNumber } = req.query;
    
    if (!bookingId || !roomNumber) {
      return res.status(400).json({ message: 'bookingId and roomNumber are required' });
    }

    const orders = await Order.find({ 
      booking: bookingId, 
      roomNumber: roomNumber 
    }).populate('booking');

    if (!orders.length) {
      return res.json({ 
        message: 'No orders for this room', 
        orders: [],
        roomInfo: { bookingId, roomNumber }
      });
    }

    const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
      orders,
      roomInfo: {
        roomNumber,
        bookingId,
        totalOrders: orders.length,
        totalAmount
      }
    });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: 'status is required' });

    const order = await Order.findById(id).populate('booking');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // When admin marks Prepared, create an invoice (including room info) and notify the booking
    if (status === 'Prepared' && order.booking) {
      try {
        const Invoice = require('../models/Invoice');
        // include room information even if amount is zero so the customer sees it on the bill
        const roomLabel = order.booking.selectedRooms && order.booking.selectedRooms.length
          ? order.booking.selectedRooms.join(', ')
          : order.roomNumber || 'N/A';

        const invoiceItems = [];
        invoiceItems.push({
          description: `Room(s): ${roomLabel}`,
          amount: 0
        });
        invoiceItems.push({ 
          order: order._id,
          description: `Food order ${order._id}`,
          amount: order.total || 0 
        });

        const invoice = await Invoice.create({
          booking: order.booking._id,
          orders: [order._id],
          items: invoiceItems,
          total: (order.total || 0),
          status: 'Pending'
        });

        const bookingToUpdate = await Booking.findById(order.booking._id);
        if (bookingToUpdate) {
          bookingToUpdate.foodInvoice = invoice._id;
          bookingToUpdate.foodBillAmount = invoice.total || 0;
          bookingToUpdate.foodBillPaid = false;
          bookingToUpdate.foodNotified = true;
          await bookingToUpdate.save();
        }
      } catch (e) {
        console.error('Failed to create food invoice/notify booking:', e.message || e);
      }
    }

    // Save and return updated order
    const updated = await Order.findById(id).populate('booking');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
