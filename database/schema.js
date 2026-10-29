const mongoose = require('mongoose');

const userProfile_Schema = new mongoose.Schema({
    userName: {type: String, required: true, trim: true},
    userId: {type: String, required: true, unique: true, trim: true},
    userPassword: {type: String, required: true, trim: true}
});

module.exports = mongoose.model("userprofiles", userProfile_Schema);