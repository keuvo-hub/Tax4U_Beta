const dotenv = require('dotenv');
dotenv.config();
const MarketingWhatsapp = require("../../models/marketing_whatsapp.model");
const {sendWhatsappSms} = require("./deliveryWhatsapp");

const cron = require('node-cron');
const nodemailer = require("nodemailer");


exports.cornWhatsapp = async () => {
        let allMails = await MarketingWhatsapp.find({status: 'scheduled'}).populate("group")

        if (allMails) {
            allMails.map(async data => {
                    const serverTime = new Date();
                    // Set your scheduled time
                    const temp_time = String(data.scheduled_date)
                    const scheduledTime = new Date(temp_time);
                    // Compare the current server time with your scheduled time
                    if (serverTime >= scheduledTime) {
                        let to = data.to
                        let whatsapp = await MarketingWhatsapp.findById(data._id);
                        //handle whatsapp
                        sendWhatsappSms(
                            to,
                            data.content,
                        ).then((response) => {
                            // @ts-ignore
                            if (!!response) {
                                whatsapp.status = 'success'
                                whatsapp.save()
                            } else {
                                whatsapp.status = 'failed'
                                whatsapp.save()
                            }
                        })
                    }
                }
            )
        }
    }
;

