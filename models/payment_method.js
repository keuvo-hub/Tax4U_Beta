const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const paymentMethodSchema = new mongoose.Schema({
    payment_method: {
        type: Number,
        enum: [1, 2, 3, 4],
        default: 2,
        required: true,
    },
}, {
    timestamps: true
});

const Payment_method = mongoose.model("Payment_method", paymentMethodSchema);

module.exports = Payment_method;
