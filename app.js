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

app.post('/create-account', async (req, res) => {
    const {userName, userId, userPassword, userCheckPassword} = req.body;

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
    const {userId} = req.body;

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

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/getuserid', (req, res) => {
    let tempMsg = req.session.tempMsg;
    res.render('getuserid', {tempMsg : tempMsg});
})

app.get('/', (req, res) => {
    res.render('welcome-page');
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