// services/paymentService.js
const axios = require('axios');
const PaymentData = require('../models/payment_data_model_2');


async function createPaymentAbcGateway(
  order_id,
  amount,
  customerReferenceNumber,
  customer_name,
  customer_mobile,
  customer_email,
  paymentType,
  date,
  userId
) {
  const apiKey = process.env.ABC_GATEWAY_API_KEY||'0de32ac2e912d0689ce2a4125d3deb09f5be1158544591170866ea9af1108a46';
  
  if (!apiKey) {
    return {
      status: false,
      error: 'API key not configured',
      details: { message: 'ABC Gateway API key is missing' }
    };
  }

  try {
    // Prepare the payload
    const payload = {
      amount: parseFloat(amount).toFixed(2),
      orderId: order_id,
      customer_name: customer_name,
      customer_mobile: customer_mobile,
      customer_email: customer_email,
      note: "wallet recharge"
    };

    const response = await axios.post(
      'https://api.abcgate.shop/api/payments/initiate',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'api-token': apiKey
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (response.status === 200 && response.data.success === true) {
      const parsedResponse = response.data.data;
      
      // Create payment record
      const payment = await PaymentData.create({
        transactionId: parsedResponse.transaction_id,
        paymentMethod: 'UPI_VIP',
        userId: userId,
        amount: amount,
        paymentType: paymentType,
        date: date,
        status: 'initialized',
        clientId: parsedResponse.order_id,
        customer_reference_number: parsedResponse.transaction_id
      });

      return {
        status: true,
        ...parsedResponse
      };
    } else {
      return {
        status: false,
        error: 'Invalid response from payment API',
        details: response.data
      };
    }
  } catch (error) {
    console.error('Error in createPaymentAbcGateway:', error);
    
    if (error.code === 'ECONNABORTED') {
      return {
        status: false,
        error: 'Payment gateway timeout',
        details: { message: 'Request timeout, please try again' }
      };
    }
    
    if (error.response) {
      return {
        status: false,
        error: 'Payment gateway error',
        details: error.response.data
      };
    }
    
    return {
      status: false,
      error: 'Internal server error',
      details: { message: 'Something went wrong while processing payment' }
    };
  }
}

module.exports = {
  createPaymentAbcGateway
};