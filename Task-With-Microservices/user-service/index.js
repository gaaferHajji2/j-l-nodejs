import express from 'express'

let app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true, }))

app.get('/', (req, res) => {
    return res.json({
        msg: "Index route"
    })
})

app.listen(3000, (err) => {
    if(err) {
        console.log("Error in creating server: ", error)
    }
    console.log(`Server running on: http://localhost:3000/`)
})