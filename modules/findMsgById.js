const messages = require('../database/message_Schema.js');

function findMsgById(MsgId) {
    return messages.findById(MsgId);
}

module.exports = findMsgById;