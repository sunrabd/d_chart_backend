require("dotenv").config();

exports.verifySSLFingerprint = (req, res) => {
    const clientFingerprint = req.headers["ssl-fingerprint"]; 
    const validFingerprint = process.env.SSL_FINGERPRINT;

    if (!clientFingerprint) {
        return res.status(400).json({ message: "SSL Fingerprint Missing" });
    }

    if (clientFingerprint !== validFingerprint) {
        return res.status(403).json({ message: "Invalid SSL Fingerprint" });
    }

    res.json({ message: "SSL Fingerprint Verified Successfully!" });
};
