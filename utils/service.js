const EventEmitter = require('events');
const mailConfig5 = require("./EmailToAdmins");
const emitter = new EventEmitter();

emitter.on("admin_notification", async (data) => {
    const {newUser} = data;
    await mailConfig5(newUser[0]);
});

module.exports = emitter;