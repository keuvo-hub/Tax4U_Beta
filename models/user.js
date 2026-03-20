const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const {Schema} = require("mongoose");

// schema design
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'please provide username'],
        minlength: 1,
        maxlength: 200,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true
    },
    lastName: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true
    },
    ID: {
        type: String,
        required: [true, 'please provide unique ID'],
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 5,
        maxlength: 200,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'role required']
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
        trim: true
    },
    confirmPassword: {
        type: String,
    },
    userStatus: {
        type: String,
        enum: ['active', 'pending', 'block', 'unconfirmed', 'banned'],
        default: 'unconfirmed'
    },
    profile_img: {
        type: String,
        trim: true
    },
    terms_conditions: {
        type: Boolean,
        required: [true, 'terms & conditions required']
    },
    otp: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    display_name: {
        type: String,
        minlength: 0,
        maxlength: 200,
        lowercase: true
    },
    description: {
        type: String,
        minlength: 0,
        maxlength: 500,
        lowercase: true
    },
    steps: {
        type: Number,
        default: 0
    },
    introduction: String,
    permission: {
        type: Schema.Types.ObjectId,
        ref: 'role',
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    key: {
        type: String,
        trim: true
    },
    //marketing
    marketing_status: {
        type: String,
        default: 'active',
        enum: ['active', 'banned']
    },
    //ticket
    ticket_departments: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_department',
    }],
    ticket_categories: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_department',
    }],
    ticket_types: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_type',
    }],
    assigned_ticket: {
        type: [{ type: Schema.Types.ObjectId, ref: 'ticket' }],
        default: []
    },

}, {
    timestamps: true
});

userSchema.plugin(paginate)
userSchema.plugin(aggregatePaginate)
const User = mongoose.model("User", userSchema);


module.exports = User;
