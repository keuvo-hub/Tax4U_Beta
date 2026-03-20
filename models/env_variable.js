const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const envVariableSchema = new mongoose.Schema({
    stripe_publishable_key: {
        type: String,
        trim: true
    },
    stripe_secret_key: {
        type: String,
        trim: true
    },
    stripe_status: {
        type: String,
        trim: true
    },
    paypal_client_id: {
        type: String,
        trim: true
    },
    paypal_secret_key: {
        type: String,
        trim: true
    },
    paypal_status: {
        type: String,
        trim: true
    },
    paypal_base_url: {
        type: String,
        trim: true
    },
    razorpay_client_id: {
        type: String,
        trim: true
    },
    razorpay_secret_key: {
        type: String,
        trim: true
    },
    razorpay_status: {
        type: String,
        trim: true
    },
    mollie_live_api_key: {
        type: String,
        trim: true
    },
    mollie_status: {
        type: String,
        trim: true
    },
    website_domain_name: {
        type: String,
        trim: true
    },
    payment_redirect: {
        type: String,
        trim: true
    },
    redirect_url: {
        type: String,
        trim: true
    },
    admin_email: {
        type: String,
        trim: true
    },
    website_name: {
        type: String,
        trim: true
    },
    aws_bucket_name: {
        type: String,
        trim: true
    },
    aws_access_key_id: {
        type: String,
        trim: true
    },
    aws_secret_access_key: {
        type: String,
        trim: true
    },
    aws_region: {
        type: String,
        trim: true
    },
    logo_url: {
        type: String,
        trim: true
    },
    company_email: {
        type: String,
        trim: true
    },
    // twilio
    twilio_number: {
        type: String,
        trim: true
    },
    twilio_auth_token: {
        type: String,
        trim: true
    },
    twilio_account_sid: {
        type: String,
        trim: true
    },
    twilio_status: {
        type: String,
        enum: ['disable', 'enable'],
        default: 'disable',
        trim: true
    },
    // sendGrid
    email_host: {
        type: String,
        trim: true
    },
    email_port: {
        type: String,
        trim: true
    },
    email_username: {
        type: String,
        trim: true
    },
    email_password: {
        type: String,
        trim: true
    },
    email_sender: {
        type: String,
        trim: true
    },
    sendgrid_status: {
        type: String,
        enum: ['enable', 'disable'],
        default: 'disable'
    },
    // gmail
    auth_email_password: {
        type: String,
        trim: true
    },
    auth_email: {
        type: String,
        trim: true
    },
    auth_service_provider: {
        type: String,
        trim: true
    },
    gmail_provider_status: {
        type: String,
        enum: ['enable', 'disable'],
        default: 'disable'
    },
    // hostinger
    hostinger_email_address: {
        type: String,
        trim: true
    },
    hostinger_password: {
        type: String,
        trim: true
    },
    hostinger_email_host: {
        type: String,
        trim: true
    },
    hostinger_email_port: {
        type: String,
        trim: true
    },
    hostinger_email_provider_name: {
        type: String,
        trim: true
    },
    hostinger_email_provider_status: {
        type: String,
        enum: ['enable', 'disable'],
        default: 'disable'
    },

    admins_email_list: {
        type: String,
        trim: true
    },
    // sign up new user's email subject
    welcome_message: {
        type: String,
        trim: true
    },

    jwt_secret: {
        type: String,
        trim: true
    },
    jwt_expire_in: {
        type: String,
        trim: true
    },
    jwt_expire_in_remember_me: {
        type: String,
        trim: true
    },
    twak_to_src_url: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

envVariableSchema.plugin(paginate)
const Env_variables = mongoose.model("Env_variables", envVariableSchema);

module.exports = Env_variables;
