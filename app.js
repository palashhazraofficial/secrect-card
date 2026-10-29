const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, "public")));

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

app.get('/getuserid', (req, res) => {
    res.render('getuserid');
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