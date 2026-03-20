const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    tax_file: {
        type: mongoose.Types.ObjectId,
        ref: 'Taxfile'
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    paid: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    payment_method: {
        type: String
    },
    payment_through: {
        type: String
    },
    payment: {}
}, {
    timestamps: true
});

paymentSchema.plugin(paginate)
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
