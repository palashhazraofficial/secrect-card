const messages = require('../database/message_Schema.js');

function deleteMsgById (MsgId) {
    return messages.findByIdAndDelete(MsgId);
}

module.exports = deleteMsgById;