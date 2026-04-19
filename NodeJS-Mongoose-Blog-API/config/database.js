const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn =  await mongoose.connect(process.env.MONGOOSE_URI || 'mongodb://localhost:27017/blog_db')
        console.log(`The connection host is: ${conn.connection.host}`)
        
        mongoose.connection.on('error', (err) => {
            console.error(`Connection error: ${err.message}`)
        })

        mongoose.connection.on('disconnected', (err) => {
            console.log('Disconnected')
        })
    } catch (error) {
        console.error(`error is: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB