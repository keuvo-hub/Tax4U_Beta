const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const userRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 100,
        lowercase: true,
        unique: true,
    },
    display_name: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 100,
    },
    logo: {
        type: String,
        trim: true,
        minlength: 0,
    },
    
    coupon_code: {
        type: mongoose.Types.ObjectId,
        ref: 'Coupon_code'
    },
}, {
    timestamps: true
});

userRoleSchema.plugin(paginate)
const UserRole = mongoose.model("UserRole", userRoleSchema);

module.exports = UserRole;
