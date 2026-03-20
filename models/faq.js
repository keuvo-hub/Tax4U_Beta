const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 500,
    },
    answer: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 1000,
    },

}, {
    timestamps: true
});

faqSchema.plugin(paginate)
const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;
