const {model, Schema} = require('mongoose')
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

let schema = new Schema({
    email: {
        default: String,
        sendgrid: {
            host: String,
            port: String,
            username: String,
            password: String,
            sender_email: String,
        },
        gmail: {
            auth_email: String,
            password: String,
            service_provider: String,
        },
        other: {
            host: String,
            port: String,
            address: String,
            password: String,
            provider_name: String,
        },
    },
    email_template: [],
    sms: {
        twilio_auth_token: String,
        twilio_sender_number: String,
        twilio_account_sid: String,
        active: {
            type: Boolean,
            default: false
        },
    },
    whatsapp: {
        twilio_auth_token: String,
        twilio_sender_number: String,
        twilio_account_sid: String,
        active: {
            type: Boolean,
            default: false
        },
    },
}, {timestamps: true})

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const MarketingSettings = model('marketing_setting', schema)

module.exports =  MarketingSettings
