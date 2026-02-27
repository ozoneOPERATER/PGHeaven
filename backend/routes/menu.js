const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Get all menu categories
router.get('/all', menuController.getMenu);

// Get menu by category (breakfast, lunch, dinner)
router.get('/category/:category', menuController.getMenuByCategory);

module.exports = router;
