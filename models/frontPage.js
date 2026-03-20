const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const frontPageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 200,
    },
    ID: {
        type: String,
        required: true,
        minlength: 0,
        unique: true
    },
    type: {
        type: String,
        required: true,
        minlength: 0,
    },
    contents: {
        type: String,
        required: true,
        minlength: 0,
    },
}, {
    timestamps: true
});

frontPageSchema.plugin(paginate)
const FrontPage = mongoose.model("FrontPage", frontPageSchema);

module.exports = FrontPage;
