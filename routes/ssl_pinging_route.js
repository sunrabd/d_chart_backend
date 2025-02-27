const express = require("express");
const router = express.Router();
const sslController = require("../controllers/ssl_pinging_controller");

// Route for SSL verification
router.get("/verify-ssl", sslController.verifySSLFingerprint);

module.exports = router;
