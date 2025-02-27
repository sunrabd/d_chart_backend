const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon_controller');
const { authenticateToken } = require('../middleware/auth_middelware');

// CRUD routes
router.post('/',authenticateToken, couponController.createCoupon);
router.post('/get',authenticateToken, couponController.getAllCoupons);
router.post('/:id',authenticateToken, couponController.getCouponById);
router.put('/:id',authenticateToken, couponController.updateCoupon);
router.delete('/:id',authenticateToken, couponController.deleteCoupon);

router.post('/verify-coupon',authenticateToken, couponController.verifyCoupon);
// Endpoint to check and update expired coupons
router.put('/check-expired',authenticateToken, couponController.checkExpiredCoupons);

module.exports = router;
