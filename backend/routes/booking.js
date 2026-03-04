const router = require('express').Router();
const bookingCtrl = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

// Debug logger: log incoming booking routes and Authorization header presence
router.use((req, res, next) => {
	try {
		console.log('[BOOKING ROUTE] %s %s auth=%s', req.method, req.originalUrl, !!req.headers.authorization);
	} catch (e) {}
	next();
});

router.post('/', protect, bookingCtrl.createBooking);
router.get('/my', protect, bookingCtrl.getUserBookings);
// Availability must come before '/:id' so it doesn't get treated as an ID
router.get('/availability', bookingCtrl.checkAvailability);
router.get('/:id', protect, bookingCtrl.getBookingById);
router.get('/', protect, admin, bookingCtrl.getAllBookings);
router.put('/:id/status', protect, admin, bookingCtrl.updateBookingStatus);
router.put('/:id/cancel', protect, bookingCtrl.cancelBooking);
router.put('/:id/payment', protect, bookingCtrl.updatePayment);
router.put('/:id/checkout', protect, bookingCtrl.checkoutBooking);
// clear food-ready notification for user
router.put('/:id/clear-food-notice', protect, bookingCtrl.clearFoodNotification);

// manual release of rooms back to PG availability (admin only)
router.put('/:id/release', protect, admin, bookingCtrl.releaseRooms);

module.exports = router;
