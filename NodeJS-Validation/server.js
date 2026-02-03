const express = require('express')
const userRouter = require('./routes/user.routes')
const orderRouter = require('./routes/order.routes')
const accountsRouter = require('./routes/accounts.routes')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/user', userRouter)
app.use('/order', orderRouter)
app.use('/accounts', accountsRouter)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.use((req, res, next) => {
    return res.status(404).json({
        msg: "Not Found"
    })
})

app.listen(3000, (error) => {
    if(error) {
        throw error
    }
    console.log("Server running on: http://localhost:3000")
})