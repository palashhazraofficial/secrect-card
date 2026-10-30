const argon2 = require('argon2');
const userprofiles = require('../database/schema.js');
const check_userId = require('./check_userId.js');

async function login_user(userId, userPassword) {
    
    try {

        const _id = await check_userId(userId); 
        
        if (!_id) { 
            return { status: false, msg: "User ID Not Found!" }; 
        } 

        const user = await userprofiles.findById(_id);
        if (!user) {
            return { status: false, msg: "User ID Not Found!" };
        }

        const isPasswordMatched = await argon2.verify(user.userPassword, userPassword); 

        if (isPasswordMatched) { 
            return {
                status: true, 
                msg: null, 
                userName: user.userName, 
                userId: user.userId, 
                user_id: user._id
            }; 
        } else { 
            return { status: false, msg: "Password Not Matched!" }; 
        } 

    } catch (err) { 
        console.error("Error during login process:", err);     
        return { status: false, msg: "An internal server error occurred." };
    } 

}

module.exports = login_user;