const router = require('express').Router();
const { register, login, forgotPassword, getUsers, updateUser, changePassword, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.put('/profile', protect, upload.single('avatar'), updateUser);
router.put('/change-password', protect, changePassword);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/profile', protect, deleteUser);
router.get('/config/upload-path', (req, res) => {
  res.json({
    uploadPath: '/uploads/pg-photos',
    maxFileSize: '5MB',
    allowedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFilesPerPG: 6
  });
});

module.exports = router;
