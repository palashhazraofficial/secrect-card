const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname, './views/home.html'));
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
})