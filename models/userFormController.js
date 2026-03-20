const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

// schema design
const userFormControlSchema = new mongoose.Schema({
    user_name: {
        type: mongoose.Types.ObjectId,
        ref: 'UserRole',
        required: true,
    },
    step_one: [
        {
            _id: mongoose.Types.ObjectId,
            input_name: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
            },
            input_type: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
            },
            select_options: [
                {
                    type: String,
                }
            ],
            link: {
                type: String,
                trim: true,
            },
            placeholder: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 200,
            },
            field_required: {
                type: Boolean,
            },
            status: {
                type: Boolean,
                required: [true, 'Form field status required']
            },
            createdAt: Date,
            updatedAt: Date,
            __v: Number
        }
    ],
    step_two: [
        {
            _id: mongoose.Types.ObjectId,
            input_name: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
            },
            input_type: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
            },
            select_options: [
                {
                    type: String,
                }
            ],
            link: {
                type: String,
                trim: true,
            },
            field_required: {
                type: Boolean,
            },
            placeholder: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 200,
            },
            status: {
                type: Boolean,
            },
            createdAt: Date,
            updatedAt: Date,
            __v: Number
        }
    ],
    step_three: [
        {
            type: String,
            trim: true,
            minlength: 0,
            maxlength: 300,
            lowercase: true,
        }
    ]
}, {
    timestamps: true
});

userFormControlSchema.plugin(paginate)
userFormControlSchema.plugin(aggregatePaginate)
const User_form_controller = mongoose.model("User_form_controller", userFormControlSchema);

module.exports = User_form_controller;
