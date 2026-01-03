const express = require('express');
const router = express.Router();
const franchiseeController = require('../controllers/franchiseeController');

router.post('/login', franchiseeController.login);
router.post('/profile', franchiseeController.getProfile);
router.post('/addSales', franchiseeController.addSales);
router.post('/getSales', franchiseeController.getSales);
router.post('/updateProfile', franchiseeController.updateProfile);
router.post('/changePassword', franchiseeController.changePassword);

module.exports = router;
