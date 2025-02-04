const PaymentFailed = require('../models/payment_failed_model');
const User = require('../models/user_model');

const createPaymentFailed = async (req, res) => {
  try {
    const { amount, userId,gateway_type, reason } = req.body;
    const paymentFailed = await PaymentFailed.create({ amount, userId,gateway_type, reason });
    res.status(201).json({ status: true, message: " payment failed!", paymentFailed });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const getPaymentFailedById = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentFailed = await PaymentFailed.findByPk(id, { include: [{ model: User, as: 'user' }] });
    if (!paymentFailed) return res.status(404).json({ status: false, message: 'Payment failed record not found' });
    res.json({ status: true, message: "Get failed payment history", paymentFailed });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const getAllPaymentFailed = async (req, res) => {
  try {
    const payments = await PaymentFailed.findAll({ include: [{ model: User, as: 'user' }], order: [['createdAt', 'DESC']], });
    res.json({ status: true, message: "Get payment history", payments });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const getPaymentFailedByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await PaymentFailed.findAll({ where: { userId }, include: [{ model: User, as: 'user' }] });
    res.json({ status: false, message: "Get failed payment history.", payments });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const updatePaymentFailed = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount,gateway_type, reason } = req.body;
    const payment = await PaymentFailed.findByPk(id);
    if (!payment) return res.status(404).json({ status: false, message: 'Payment failed record not found' });

    await payment.update({ amount,gateway_type, reason });
    res.json({ status: false, message: "update payment successfully", payment });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const deletePaymentFailed = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await PaymentFailed.findByPk(id);
    if (!payment) return res.status(404).json({ status: false, message: 'Payment failed record not found' });

    await payment.destroy();
    res.json({ status: true, message: 'Payment failed record deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

module.exports = {
  createPaymentFailed,
  getPaymentFailedById,
  getAllPaymentFailed,
  getPaymentFailedByUser,
  updatePaymentFailed,
  deletePaymentFailed
};
