const messages = require('../database/message_Schema.js');

async function fetch_msg (userId) {
    const InboxMessages = await messages.find({receiverUserId: userId})
    return InboxMessages;
}

module.exports = fetch_msg;