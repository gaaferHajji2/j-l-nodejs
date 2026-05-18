import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

let app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true, }))

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