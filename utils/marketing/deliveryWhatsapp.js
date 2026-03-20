const MarketingSettings = require("../../models/marketing_setting.model");

exports.sendWhatsappSms = async (to, body) => {
    const setting = await MarketingSettings.findOne({});
    const authToken = setting.whatsapp.twilio_auth_token;
    const accountSid = setting.whatsapp.twilio_account_sid;
    const client = require("twilio")(accountSid, authToken);

    console.log(to)
    to.forEach((number) => {
        try {
           const data =  client.messages
                .create({
                    body,
                    to: 'whatsapp:' + number,
                    from: 'whatsapp:' + setting.whatsapp.twilio_sender_number
                })
            console.log(data)
        } catch (e) {

        }
    })
    return true;


}
