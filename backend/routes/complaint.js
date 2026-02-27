const router = require('express').Router();
const ctrl = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, ctrl.createComplaint);
router.get('/my', protect, ctrl.getUserComplaints);
router.get('/', protect, admin, ctrl.getAllComplaints);
router.put('/:id/status', protect, admin, ctrl.updateComplaintStatus);

module.exports = router;
