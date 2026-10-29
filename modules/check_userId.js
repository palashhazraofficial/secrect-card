const userprofiles = require('../database/schema.js');

async function check_userId (userId) {
    const userExists = await userprofiles.exists({userId});
    return userExists;
}

module.exports = check_userId;