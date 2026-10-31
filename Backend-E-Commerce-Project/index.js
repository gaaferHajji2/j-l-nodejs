require("dotenv/config");
const express = require("express");
const { default: mongoose } = require("mongoose");
require('express-async-errors');
const app = express();
const morgan = require("morgan");
const cors = require('cors');

// Here we use Middleware.
app.use(cors());
app.options("*", cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));

// HERE we use Models.
//const Product = require("./models/product");
require("./routes/routes")(app);

const api = process.env.API_URL;
const db  = process.env.DB_URL;

// app.get("/", (req, res) =>{
//     return res.send("Salam Alekoum from API " + api).end();
// });

mongoose.connect(db, 
    { useUnifiedTopology: true, useNewURLParser: true })
    .then((conn)=> {
        console.log("DB Connection OK");
        //console.log(typeof conn);
        //console.log(conn);
}).catch(err => {
    console.log("Error In Connecting to DB");
    console.error("The Error is: ", err);
})

app.listen(3000, ()=>{
    //console.log("The API_URL From Express is: ", app.get("API_URL"));
    console.log("Server Running on port 3000...");
});