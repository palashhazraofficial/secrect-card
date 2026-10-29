const userprofiles = require('../database/schema.js');

function save_data_into_db (userName, userId, userPassword) {
    const newUser = new userprofiles ({
        userName,
        userId,
        userPassword
    });

    return newUser.save();
}

module.exports = save_data_into_db;