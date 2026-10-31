const userprofiles = require('../database/userProfile_Schema.js');

async function check_userId (userId) {
    const userExists = await userprofiles.exists({userId});
    return userExists;
}

module.exports = check_userId;