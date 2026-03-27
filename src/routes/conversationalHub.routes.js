const express = require("express");
const { protect } = require("../../middleware/authProtect");
const {
  handleConversationalHubMessage,
} = require("../controllers/conversationalHub.controller");

const router = express.Router();

router.post(
  "/message",
  
  handleConversationalHubMessage
);

module.exports = router;
