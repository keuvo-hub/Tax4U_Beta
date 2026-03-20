const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    ratting: {
        type: Number,
        required: true,
        trim: true,
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 300,
    },
}, {
    timestamps: true
});

feedbackSchema.plugin(paginate)
const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
