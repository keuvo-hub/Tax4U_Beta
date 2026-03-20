const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const Env_variables = require('../models/env_variable');

function capitalizeFirstLetter(string) {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
}

const assignedEmailToAC = async (data = {}, n, cnt) => {
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
        to: `${data.assigned_accountant.email}`,
        subject: `New tax file assigned`,
        html:
            `
            <div style="background-color:white; width: 100%; height: 100vh; position: relative;">
                <div style="height: 20%; width: 100%; background-color: #FF4200;">
                    <div style="margin: auto; width: 50%; padding-top: 50px;">
                        <div
                            style="position: absolute; top: 100px; width: 500px;  border: 1px solid white; border-radius: 5px; background-color: white; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; padding: 30px; font-family:sans-serif; color: #666666; border: 1px solid gray">

                            <div style="margin: 30px; text-align: center;">
                                <img src=${envFileData?.logo_url}
                                    style=" width: 150px; height: 35px;" />
                            </div>

                            <p style="font-size: 18px;">
                                Admin assigned you ${n == 1 ? (n + ` file`) : (n + ` files`)}, please check in your account.
                            </p>

                            <p style="font-size: 18px; font-weight: 600;">Submission ID: ${cnt}</p>

                            <div
                                style="border-radius: 5px; background-color: rgba(0,0,0, .1); padding: 10px; margin: 30px 0px;">
                                <a href="http://accountant.Taxants.tk">
                                    <button
                                        style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-size: 16px; text-align: center; cursor: pointer;background-color: rgb(211, 23, 211); color: white; border: none; border-radius: 5px; outline: none; border: 1px solid goldenrod; font-weight: 600;">

                                        Visit Your Dashboard
                                    </button>
                                </a>
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

module.exports = assignedEmailToAC;