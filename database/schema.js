const mongoose = require('mongoose');

const userProfile_Schema = new mongoose.Schema({
    userName: {type: String, required: true},
    userId: {type: String, required: true},
    userPassword: {type: String, required: true}
});

module.exports = mongoose.model("userProfiles", userProfile_Schema);