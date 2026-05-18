import Express from 'express'

app = Express()

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