const Coupon = require('../models/coupon_model');

// Create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        const { name, discount, expiration_date, status,is_discountin_percent } = req.body;

        // Automatically set status based on expiration date
        // const status = new Date(expiration_date) > new Date();

        const coupon = await Coupon.create({
            name,
            discount,
            expiration_date,
            status,
            is_discountin_percent,
        });

        res.status(201).json({ status: true, message: 'Coupon created successfully', coupon });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        res.status(200).json({ status: true, message: "get all coupons successfully", data: coupons });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get a single coupon by ID
exports.getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ status: false, message: 'Coupon not found' });
        }

        res.status(200).json({ status: false, message: "Get coupon successfully.", coupon });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, discount, expiration_date, is_discountin_percent } = req.body;

        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ status: false, message: 'Coupon not found' });
        }

        // Automatically update the status if expiration_date changes
        const status = expiration_date
            ? new Date(expiration_date) > new Date()
            : coupon.status;

        await coupon.update({ name, discount, expiration_date,is_discountin_percent, status });

        res.status(200).json({ status: true, message: 'Coupon updated successfully', coupon });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ status: false, message: 'Coupon not found' });
        }

        await coupon.destroy();
        res.status(200).json({ status: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Check and update expired coupons
exports.checkExpiredCoupons = async (req, res) => {
    try {
        const now = new Date();
        const expiredCoupons = await Coupon.update(
            { status: false },
            {
                where: {
                    expiration_date: {
                        [Op.lt]: now,
                    },
                    status: true,
                },
            }
        );

        res
            .status(200)
            .json({ status: true, message: `${expiredCoupons[0]} coupons marked as expired` });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};
