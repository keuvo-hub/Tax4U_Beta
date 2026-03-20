const dotenv = require('dotenv');
dotenv.config();
const MarketingSms = require("../../models/marketing_sms.model");
const {sendTwilioMarketingSms} = require("./deliverySMS");

const cron = require('node-cron');
const nodemailer = require("nodemailer");

exports.cornSms = async () => {
        let allMails = await MarketingSms.find({status: 'scheduled'}).populate("group")

        if (allMails) {
            allMails.map(async data => {

                    const serverTime = new Date();
                    // Set your scheduled time
                    const temp_time = String(data.scheduled_date)
                    const scheduledTime = new Date(temp_time);
                    // Compare the current server time with your scheduled time
                    if (serverTime >= scheduledTime) {
                        let to = data.to;
                        try {
                            to.forEach((x) => {
                                sendTwilioMarketingSms(
                                    x,
                                    data.content,
                                )
                            })
                            let sms = await MarketingSms.findById(data._id);
                            sms.status = 'success'
                            sms.save()
                        } catch (e) {
                            let sms = await MarketingSms.findById(data._id);
                            sms.status = 'failed'
                            sms.save()
                        }
                    }
                }
            )
        }
    }
;

