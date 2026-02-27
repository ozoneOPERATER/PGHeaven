const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

// Delay Razorpay client creation until needed so server can run without env vars
function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

// Create a Razorpay order for an invoice/booking
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) return res.status(400).json({ message: 'bookingId and amount are required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const amountPaise = Math.round(amount * 100);
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${bookingId}_${Date.now()}`,
      payment_capture: 1
    };

    const client = getRazorpayClient();
    if (!client) return res.status(500).json({ message: 'Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });

    const order = await client.orders.create(options);

    // Save razorpayOrderId on booking for reference
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create order' });
  }
};

// Razorpay webhook handler - expects raw body
exports.razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const raw = req.body;
    if (secret) {
      const shasum = crypto.createHmac('sha256', secret).update(raw).digest('hex');
      const signature = req.headers['x-razorpay-signature'];
      if (shasum !== signature) return res.status(400).json({ message: 'Invalid signature' });
    }

    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // Handle payment captured event
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const razorpayPaymentId = payment.id;
      const razorpayOrderId = payment.order_id;
      // Find invoice or booking by razorpayOrderId
      const invoice = await Invoice.findOne({ razorpayOrderId });
      if (invoice) {
        invoice.status = 'Paid';
        invoice.razorpayPaymentId = razorpayPaymentId;
        await invoice.save();
        // mark orders billed
        await require('../models/Order').updateMany({ _id: { $in: invoice.orders } }, { billed: true });
      }
      const booking = await Booking.findOne({ razorpayOrderId });
      if (booking) {
        booking.paymentStatus = 'Paid';
        booking.razorpayPaymentId = razorpayPaymentId;
        booking.amountPaid = booking.amountDue;
        await booking.save();
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error', err);
    res.status(500).json({ message: 'Webhook handling failed' });
  }
};
