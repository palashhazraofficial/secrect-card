const messages = require('../database/message_Schema.js');

async function fetch_msgCount (userId) {
    const MsgNo = await messages.countDocuments({receiverUserId: userId})
    return MsgNo;
}

module.exports = fetch_msgCount;