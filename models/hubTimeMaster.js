const mongoose = require("mongoose");

const hubLeadSchema = new mongoose.Schema({
  visitorId: { type: String, index: true },

  linkedUserId: { type: mongoose.Schema.Types.ObjectId, default: null },
  linkedUserSn: { type: Number, default: null },
  convertedAt: { type: Date, default: null },

  leakProfile: {
    language: { type: String, default: null },
    serviceInterest: { type: String, default: null },
    email0: { type: String, default: null },
    mobile0: { type: String, default: null }
  },

  timeMaster: {
    firstSeenAt: Date,
    lastSeenAt: Date,

    firstCallChat0At: Date,
    lastCallChat0At: Date,

    firstCallChat1At: Date,
    lastCallChat1At: Date,

    firstPrestackAt: Date,
    lastPrestackAt: Date,

    firstStack0At: Date,
    lastStack0At: Date,

    firstStack1At: Date,
    lastStack1At: Date,

    firstStep1At: Date,
    lastStep1At: Date,

    firstStep2At: Date,
    lastStep2At: Date,

    firstQualifiedLeadAt: Date,
    lastQualifiedLeadAt: Date,

    firstSignupAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("HubTimeMaster", hubLeadSchema);
