const mongoose = require('mongoose');

const message_Schema = new mongoose.Schema({
    senderName: {type: String, required: true},
    senderUserId: {type: String, required: true},
    receiverUserId: {type: String, required: true},
    msgTime: {type: String, required: true},
    message: {type: String, required: true}
});

module.exports = mongoose.model("messages", message_Schema);