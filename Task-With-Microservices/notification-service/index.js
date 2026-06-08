import express from 'express'

app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/health", (req, res) => {
    return res.json({
        hello: "hello task route"
    })
})
