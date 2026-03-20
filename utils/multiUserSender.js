const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const Env_variables = require('../models/env_variable');

function capitalizeFirstLetter(string) {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
}

// email to the user
const mailConfig4 = async (data = {}, verifyLink) => {
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
        from: email_from,
        to: data.email,
        subject: envFileData?.welcome_message,
        html:
            `
            <div style="background-color:white; width: 100% ; height: 100vh; position: relative;">
                <div style="height: 20%; width: 100%; background-color: #FF4200;">
                    <div style="margin: auto; width: 50%; padding-top: 50px;">
                        <div
                            style="position: absolute; top: 100px; width: 500px;  border: 1px solid white; border-radius: 5px; background-color: white; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; padding: 30px; font-family:sans-serif; color: #666666; border: 1px solid gray">

                            <div style="margin: 30px; text-align: center;">
                                <img src=${envFileData?.logo_url}
                                    style=" width: 150px; height: 35px;" />
                            </div>

                            <p style="font-size: 18px;">
    Welcome ${data.username}, here is your account activation link:
</p>

<div style="margin: 30px 0; text-align: center;">
    <a href="${verifyLink}"
       style="display: inline-block; background-color: #14A940; color: #ffffff; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: 600;">
        Activate Account
    </a>
</div>

<div style="border-radius: 5px; background-color: rgba(0,0,0,.06); padding: 12px; margin: 20px 0; word-break: break-all;">
    If the button does not work, copy and paste this link into your browser:<br />
    <a href="${verifyLink}" style="color: #14A940; text-decoration: none;">${verifyLink}</a>
</div>

<div style="font-size: 14px; margin: 30px 0px;">
    <p>
        <strong>Note:</strong> Please activate your account within 24 hours.
    </p>
</div>
                            <p style="font-size: 16px; ">Kind Regards,<br />${capitalizeFirstLetter(envFileData?.website_name)} Team</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    });

    return info
};

module.exports = mailConfig4;
