const productRouter = require("./product");
const categoryRouter = require("./category");
const orderRouter    = require("./order");
const userRouter     = require("./user");
const express = require('express');


const api = process.env.API_URL;

module.exports = function(app) {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(`${api}/products`, productRouter);
    app.use(`${api}/categories`, categoryRouter);
    app.use(`${api}/orders`, orderRouter);
    app.use(`${api}/users`, userRouter);

    app.use((err, req, res, next) => {
        console.log("Error Happened", err.message);
        console.log("The Error is: ", err);

        return res
        .status(502)
        .json({ 
            status: false, 
            message: "Sorry Internal Server Error "
        }).end();
    })
}