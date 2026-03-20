const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const taxFilePricesSchema = new mongoose.Schema({
  user_role: {
    type: String,
    required: true,
    trim: true
  },
  currency: {
    type: String,
    required: true,
    trim: true
  },
  taxfees: {
    type: Number,
    required: [true, 'please provide tax fees if student'],
    min: 0
  },
  service_charges: {
    type: Number,
    required: [true, 'please provide service charges'],
    min: 0
  },
  welcome_benefit: {
    type: Number,
    required: [true, 'please provide welcome_canada_benefit'],
    min: 0
  },
  additional_fees: [
    {
      additional_fee_name: String,
      additional_fee: Number,
    },
  ]
}, {
  timestamps: true
});

taxFilePricesSchema.plugin(paginate)
const Taxfile_price = mongoose.model("Taxfile_price", taxFilePricesSchema);

module.exports = Taxfile_price;
