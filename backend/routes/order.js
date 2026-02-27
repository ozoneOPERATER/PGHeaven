const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, ctrl.createOrder);
router.post('/booking/:bookingId', protect, ctrl.createOrderForBooking);
router.get('/my', protect, ctrl.getUserOrders);
router.get('/room', protect, ctrl.getOrdersByRoom);
router.get('/', protect, admin, ctrl.getAllOrders);
router.put('/:id/status', protect, admin, ctrl.updateOrderStatus);

module.exports = router;
