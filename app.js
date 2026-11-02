const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const argon2 = require('argon2');
require('dotenv').config();

const check_userId = require('./modules/check_userId.js');
const save_data_into_db = require('./modules/save_data_into_db.js');
const login_user = require('./modules/login_user.js');
const send_msg = require('./modules/send_msg.js');
const fetch_msg = require('./modules/fetch_msg.js');
const fetch_msgCount = require('./modules/fetch_msgCount.js');
const findMsgById = require('./modules/findMsgById.js');
const deleteMsgById = require('./modules/deleteMsgById.js');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded());

const MONGODB_URL = process.env.MONGODB_URL;
const SECRECT_SESSION_KEY = process.env.SECRECT_SESSION_KEY;

const store = new MongoDBStore ({
    uri: MONGODB_URL,
    collection: 'sessions'
})

app.use(session({
    secret: SECRECT_SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: store
}))

app.post('/login', async (req, res) => {
    const userId = req.body.userId.trim();
    const userPassword = req.body.userPassword.trim();
    const response = await login_user(userId, userPassword);

    if(!response.status) {
        req.session.tempMsg = response.msg;
        return res.redirect('/login');
    } else {
        req.session.isLoggedIn = true;
        req.session.userName = response.userName;
        req.session.userId = response.userId;
        req.session.user_id = response.user_id.toString();
        req.session.tempMsg = null;
        return res.redirect('/inbox');
    }

})

app.post('/create-account', async (req, res) => {
    const userName = req.body.userName.trim();
    const userId = req.body.userId.trim();
    const userPassword = req.body.userPassword.trim();
    const userCheckPassword = req.body.userCheckPassword.trim();

    if (userPassword === userCheckPassword) {

        const hashedPassword = await argon2.hash(userPassword);
        save_data_into_db(userName, userId, hashedPassword).then(() => {
            req.session.tempMsg = null;
            return res.redirect('login');
        }).catch((err) => {
            console.log("Error while saving data into database: ", err);
            req.session.tempMsg = "Error while saving data into database. Please resubmit the form."
            return res.redirect('/getuserid');
        })

    } else {
        req.session.tempMsg = "Password match incorrect! Please enter values correctly."
        return res.redirect('/getuserid');
    }
})

app.post('/signup', async (req, res) => {
    const userId = req.body.userId.trim();

    if (!userId) {
        req.session.tempMsg = "User ID required! Please enter a valid one.";
        return res.redirect('/getuserid');
    } else {
        const userExists = await check_userId(userId);

        if (userExists) {
            req.session.tempMsg = "User ID already exists! Please enter a new one.";
            return res.redirect('/getuserid');
        } else {
            req.session.tempMsg = null;
            req.session.userId = userId;
            let tempMsg = req.session.tempMsg;
            return res.render('signup', {userId, tempMsg});
        }

    }

})

app.post('/send-card/:userId', async (req, res) => {

    const dbUserId = req.session.userId;
    const senderUserId = req.params.userId;

    if (req.session.isLoggedIn || dbUserId === senderUserId) {

        let senderName = req.session.userName;

        let msgTime = localDate.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "medium",
            hour12: true
        }); 

        let message = req.body.message;
        let receiverUserId = req.body.userId.trim();

        let receiverDetails = await check_userId(receiverUserId);

        if (!message || !receiverUserId) {

            req.session.tempMsg = "Fill all the details first!"
            return res.redirect('/send-card');

        } else if (!receiverDetails){

            req.session.tempMsg = "User Id does not exists!"
            return res.redirect('/send-card');

        } else {

            send_msg(senderName, senderUserId, receiverUserId, msgTime, message).then(() => {
                req.session.tempMsg = null;
                return res.redirect('/send-card');
            }).catch((err) => {
                console.log("Internal server error! Message isn't send", err);
                req.session.tempMsg = "Internal server error! Message isn't send";
                return res.redirect('/send-card');
            })

        }

    } else {

        req.session.isLoggedIn = false;
        return res.redirect('/');

    }


})

app.get('/inbox/:receiverUserId/:MsgId', async (req, res) => {

    const receiverUserId = req.params.receiverUserId;
    const MsgId = req.params.MsgId;
    const dbUserId = req.session.userId;

    if (req.session.isLoggedIn || receiverUserId === dbUserId) {

        findMsgById(MsgId).then((Message) => {
            req.session.tempMsg = null;
            return res.render('message-page', {Message});
        }).catch((err) => {
            console.log("An internal server problem occured while finding messages: ", err);
            req.session.tempMsg = "An internal server problem occured! Try again."
            return res.redirect('/inbox');
        })

    } else {
        return res.redirect('/');
    }

})

app.get('/inbox/:receiverUserId/:MsgId/delete', async (req, res) => {

    const receiverUserId = req.params.receiverUserId;
    const MsgId = req.params.MsgId;
    const dbUserId = req.session.userId;

    if (req.session.isLoggedIn || receiverUserId === dbUserId) {

        deleteMsgById(MsgId).then(() => {
            req.session.tempMsg = null;
            return res.redirect('/inbox');
        }).catch((err) => {
            console.log("An internal server problem occured while deleting message: ", err);
            req.session.tempMsg = "An internal server problem occured! Try again.";
            return res.redirect('/inbox'); 
        })

    } else {
        return res.redirect('/');
    }

})

app.post('/inbox/:receiverUserId/:MsgId/deleteAndSendMsg', async (req, res) => {

    const senderName = req.session.userName;
    const senderUserId = req.params.receiverUserId;
    const receiverUserId = req.body.receiverUserId;
    const msgTime = new Date().toLocaleString();
    const message = req.body.message;
    const MsgId = req.params.MsgId;
    const dbUserId = req.session.userId;

    if (req.session.isLoggedIn || senderUserId === dbUserId) {

        send_msg(senderName, senderUserId, receiverUserId, msgTime, message).then(() => {
            req.session.tempMsg = null;
        }).catch((err) => {
            console.log("Error while saving message: ", err);
            req.session.tempMsg = "Error while sending message! Please try again.";
            return res.redirect('/inbox');
        })

        deleteMsgById(MsgId).then(() => {
            req.session.tempMsg = null;
            return res.redirect('/inbox');
        }).catch((err) => {
            console.log("An internal server problem occured while deleting message: ", err);
            req.session.tempMsg = "An internal server problem occured! Try again.";
            return res.redirect('/inbox'); 
        })

    } else {
        return res.redirect('/');
    }

})

app.get('/inbox', async (req, res) => {
    if(req.session.isLoggedIn) {
        let userId = req.session.userId;
        let tempMsg = req.session.tempMsg;
        const InboxMessages = await fetch_msg(userId);
        const MsgNo = await fetch_msgCount(userId);
        return res.render('inbox', {InboxMessages, MsgNo, tempMsg});
    } else {
        
        return res.redirect('/');
    }
})

app.get('/send-card', async (req, res) => {
    if(req.session.isLoggedIn) {
        let userId = req.session.userId;
        let tempMsg = req.session.tempMsg;
        const MsgNo = await fetch_msgCount(userId);
        return res.render('send-card', {userId, tempMsg, MsgNo});
    } else {
        return res.redirect('/');
    }
})

app.get('/profile', async (req, res) => {
    if(req.session.isLoggedIn) {
        let userId = req.session.userId;
        const MsgNo = await fetch_msgCount(userId);
        return res.render('profile', {MsgNo});
    } else {
        return res.redirect('/');
    }
})

app.get('/login', (req, res) => {
    if(!req.session.isLoggedIn) {
        let tempMsg = req.session.tempMsg;
        return res.render('login', {tempMsg});
    } else {
        return res.redirect('/inbox');
    }
})

app.get('/getuserid', (req, res) => {
    if(!req.session.isLoggedIn) {
        let tempMsg = req.session.tempMsg;
        return res.render('getuserid', {tempMsg : tempMsg});
    } else {
        return res.redirect('/inbox');
    }
})

app.get('/', (req, res) => {
    if(!req.session.isLoggedIn) {
        return res.render('welcome-page');
    } else {
        return res.redirect('/inbox');
    }
})

const PORT = 3000;
mongoose.connect(MONGODB_URL).then(() => {
    console.log("Successfully Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`server is running at http://localhost:${PORT}`);
    })
}).catch((err) => {
    console.log("Error While Connecting to MongoDB: ", err);
})