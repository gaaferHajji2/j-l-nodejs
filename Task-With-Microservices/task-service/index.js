import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import taskRouter from './routes/task.route'

dotenv.config()

let app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true, }))

let main = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    console.log(`Connect to Mongodb successfully`)
}
main().catch((err) => console.log(`Error in connecting to MongoDB`, err))

app.use("/api/users", taskRouter)
app.get("/health", (req, res) => {
    return res.json({
        hello: "hello task route"
    })
})

let PORT = process.env.PORT || 3000
app.listen(PORT, (err) => {
    if(err) {
        console.log("Error in creating server: ", error)
    }
    console.log(`Server running on: http://localhost:${PORT}/`)
})