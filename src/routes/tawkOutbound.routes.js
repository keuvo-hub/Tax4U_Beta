const express = require("express");
const { handleTawkOutbound } = require("../controllers/tawkOutbound.controller");

const router = express.Router();

router.post("/tawk-outbound", handleTawkOutbound);

module.exports = router;
