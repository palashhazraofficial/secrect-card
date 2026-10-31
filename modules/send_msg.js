const messages = require('../database/message_Schema.js');

function send_msg (senderName, senderUserId, receiverUserId, msgTime, message) {
    const newMsg = new messages ({
        senderName, 
        senderUserId, 
        receiverUserId,
        msgTime, 
        message
    });

    return newMsg.save();
}

module.exports = send_msg;