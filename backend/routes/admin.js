const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.get('/allApplicants', adminController.getAllApplicants);
router.post('/acceptApplicant', adminController.acceptApplicant);
router.post('/rejectApplicant', adminController.rejectApplicant);
router.post('/grantApplicant', adminController.grantApplicant);
router.post('/saveFranchiseCred', adminController.saveFranchiseCred);
router.post('/getUserSales', adminController.getUserSales);
router.post('/getProfile', adminController.getProfile);
router.post('/updateProfile', adminController.updateProfile);
router.post('/changePassword', adminController.changePassword);

module.exports = router;
