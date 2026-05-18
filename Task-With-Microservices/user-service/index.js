import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

let app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true, }))

let main = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    console.log(`Connect to Mongodb successfully`)
}

main().catch((err) => console.log(`Error in connecting to MongoDB`, err))

app.get('/', (req, res) => {
    return res.json({
        msg: "Index route"
    })
})

let PORT = process.env.PORT || 3000
app.listen(PORT, (err) => {
    if(err) {
        console.log("Error in creating server: ", error)
    }
    console.log(`Server running on: http://localhost:${PORT}/`)
})