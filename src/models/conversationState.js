const mongoose = require("mongoose");

const conversationStateSchema = new mongoose.Schema({
  userSn: { type: String, required: true, index: true },
  stack: { type: String, default: "stack1" },
  visibleClone: { type: String, default: "clone1" },
  activeTaxFileId: { type: String, default: null },
  lastMessage: { type: String, default: "" },
  lastSurface: { type: String, default: "" },
  language: { type: String, default: "en" }
}, { timestamps: true });

module.exports = mongoose.model("ConversationState", conversationStateSchema);
