const mongoose = require('mongoose');

const userProfile_Schema = new mongoose.Schema({
    userName: {type: String, required: true},
    userId: {type: String, required: true, unique: true},
    userPassword: {type: String, required: true}
});

module.exports = mongoose.model("userprofiles", userProfile_Schema);