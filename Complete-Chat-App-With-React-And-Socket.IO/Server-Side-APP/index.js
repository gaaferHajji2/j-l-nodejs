require('dotenv/config');
const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

/**
 * * The Users Routes Section.
 */
const userRoutes = require("./routes/userRoutes");

/**
 * * The Chats Routes Section.
 */
const chatRoutes = require("./routes/chatRoutes");

/**
 * * The Message Routes Section.
 */
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

/**
 * The Routes Section.
 */
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
////////////////////////////////////////////////////////////////////////

app.use((err, req, res, next) => {
    console.error("The Error Message is: ", err);
    return res.status(500).json({
        "status": false,
        "msg-01": "حدث خطأ في السيرفر، يرجى المحاولة لاحقا",
        "msg": err.message,
    });
});

mongoose.connect(process.env.DB_URL).then((connect) => {
    console.log("Successfully Connecting To MongoDB");
}).catch((err) => {
    console.log("Error During Connecting To Server");
    throw err;

    // process.exit(1);
});

app.get('/', (req, res) => {
    res.send({ msg: "Testing OK!!!" });
});

app.listen(process.env.PORT, () => {
    console.log(`Listen on PORT ${process.env.PORT} on Localhost`);
});