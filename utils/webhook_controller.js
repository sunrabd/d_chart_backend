// webhook code
// const axios = require('axios');
// const crypto = require('crypto');
// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/user_model');
const PaymentData = require('../models/payment_data_model');
const Deposit = require('../models/deposite_model');
const Transaction = require('../models/transaction_model');

dotenv.config();

// Initialize Express app
const app = express();
const router = express.Router();

// Middleware to parse JSON request bodies
app.use(express.json());

exports.getSkillPaymentDetails = async (req, res) => {
    const { AuthID, respData, AggRefNo } = req.body;
    const AUTH_KEY = process.env.AuthKey;
    const IV = AUTH_KEY.substring(0, 16);
  
    try {
      const formattedRespData = respData.replace(/ /g, '+');
      const decryptedData = decryptData(formattedRespData, AUTH_KEY, IV);
      const parsedResponse = JSON.parse(decryptedData);
  
      const {
        CustRefNum,
        PayAmount,
        payStatus,
        resp_message,
        PaymentDate,
        ContactNo,
        resp_code,
        EmailId
      } = parsedResponse;
    
      const findUserPayment = await PaymentData.findByPk(CustRefNum);
  
      if (findUserPayment.status !== "success" && findUserPayment.status !== "failure") {
        if (payStatus === "Ok" && resp_code === "00000") {
          await User.addAmount(findUserPayment.userId, findUserPayment.amount);
  
          const findUser = await User.findOneById(findUserPayment.userId);
          await Transaction.create({
            userId: findUserPayment.userId,
            userBalance: findUser.balance,
            transactionType: "upiMoney",
            message: "Wallet amount added by UPI payment by user",
            withdrawMoney: findUserPayment.amount,
            date: PaymentDate,
            type: "add",
          });
  
          await Deposit.updatePaymentStatus(CustRefNum, "SUCCESS", resp_message);
          await PaymentData.updateStatusByTransactionId(CustRefNum, "SUCCESS");
  
          try {
            const message = `Deposit of ${findUserPayment.amount}/- Rs Successful & Added To Your Wallet ✅🤑💰`;
            const title = `Dear ${findUser.name} 👑👑`;
            await sendNotificationToUserDevice(message, findUser.id, title);
          } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
          }
  
         // console.log("Payment success and user balance updated for transaction ID:", CustRefNum);
        } else {
          await Deposit.updatePaymentStatus(CustRefNum, "FAILED", resp_message);
          await PaymentData.updateStatusByTransactionId(CustRefNum, "FAILED");
  
         // console.log("Payment failed for transaction ID:", CustRefNum);
        }
  
        const currentTimeIst = moment().tz("Asia/Kolkata");
        const date = currentTimeIst.format("YYYY-MM-DD HH:mm:ss");
        const encodedResponse = JSON.stringify(parsedResponse);
        const response = await Payment.create({ response: encodedResponse, date: date });
  
        return res.status(200).json({
          status: true,
          msg: "Payment data processed successfully",
          data: response,
        });
      } else {
        //console.log("Payment already processed for transaction ID:", CustRefNum);
        return res.status(200).json({
          status: false,
          msg: "Payment already processed",
        });
      }
  
    } catch (error) {
      console.error("Error processing payment callback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
function decryptData(encryptedData, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}