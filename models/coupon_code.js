const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const couponCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 0,
    maxlength: 250,
    unique: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['percentage', 'amount'],
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['disabled', 'active'],
    default: 'disabled'
  },
  coupon_description: {
    type: String,
    trim: true,
    minlength: 0,
    maxlength: 500
  },
  coupon_minimum_amount: {
    type: String,
    trim: true,
    minlength: 0,
  },
  start_duration: {
    type: Date,
    trim: true,
  },
  end_duration: {
    type: Date,
    trim: true,
  }

}, {
  timestamps: true
});

couponCodeSchema.plugin(paginate)
const CouponCode = mongoose.model("Coupon_code", couponCodeSchema);

module.exports = CouponCode;
