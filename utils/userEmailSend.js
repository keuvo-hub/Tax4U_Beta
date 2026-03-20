const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const Env_variables = require('../models/env_variable');


const mailConfig2 = async (data) => {
    const envFileData = await Env_variables.findOne({});
    let transporter, email_from;
    if (envFileData?.sendgrid_status === 'enable') {
        transporter = nodemailer.createTransport({
            host: envFileData?.email_host,
            port: envFileData?.email_port,
            secure: false,
            auth: {
                user: envFileData?.email_username,
                pass: envFileData?.email_password,
            },
        });
        email_from = envFileData?.email_sender;

    } else if (envFileData?.gmail_provider_status === 'enable') {
        transporter = nodemailer.createTransport({
            secure: false,
            service: envFileData?.auth_service_provider,
            auth: {
                user: envFileData?.auth_email,
                pass: envFileData?.auth_email_password,
            },
        });
        email_from = envFileData?.auth_email;

    } else if (envFileData?.hostinger_email_provider_status === 'enable') {
        transporter = nodemailer.createTransport({
            host: envFileData?.hostinger_email_host,
            port: envFileData?.hostinger_email_port,
            secure: false,
            auth: {
                user: envFileData?.hostinger_email_address,
                pass: envFileData?.hostinger_password,
            },
        });
        email_from = envFileData?.hostinger_email_address;
    }

    // config for end user
    const info = await transporter.sendMail({
        from: email_from,                // sender address
        to: data.email,                             // list of receivers
        subject: data.subject,              // Subject line
        html: `<p>${data.message}</p>`,   // html body
    });

    return info
};

module.exports = mailConfig2;