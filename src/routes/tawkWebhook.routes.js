const express = require("express");
const { verifyTawkSignature } = require('../middleware/tawkSignature');
const { handleTawkWebhook } = require("../controllers/tawkWebhook.controller");

const router = express.Router();

// Endpoint oficial Tawk.to webhook
router.post("/tawk-webhook", verifyTawkSignature, handleTawkWebhook);

module.exports = router;
