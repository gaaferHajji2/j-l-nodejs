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
