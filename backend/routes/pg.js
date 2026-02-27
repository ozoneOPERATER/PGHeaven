const router = require('express').Router();
const pgCtrl = require('../controllers/pgController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', pgCtrl.getPGs);
router.get('/stats', protect, admin, pgCtrl.getStats);
router.get('/my-ratings', protect, pgCtrl.getUserRatings);
router.get('/:id', pgCtrl.getPGById);
router.post('/', protect, admin, upload.array('images', 6), pgCtrl.createPG);
router.put('/:id', protect, admin, upload.array('images', 6), pgCtrl.updatePG);
router.put('/:id/rate', protect, pgCtrl.ratePG);
router.delete('/:id', protect, admin, pgCtrl.deletePG);

module.exports = router;
