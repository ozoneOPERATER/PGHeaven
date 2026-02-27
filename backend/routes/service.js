const router = require('express').Router();
const svc = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, svc.createService);
router.get('/my', protect, svc.getUserServices);
router.get('/', protect, admin, svc.getAllServices);
router.put('/:id/status', protect, admin, svc.updateServiceStatus);

module.exports = router;
