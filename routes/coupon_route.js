const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon_controller');

// CRUD routes
router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
// Endpoint to check and update expired coupons
router.put('/check-expired', couponController.checkExpiredCoupons);

module.exports = router;
