import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = __dirname+'/../.env'
console.log(`Path is: ${path}`)

dotenv.config({ path })
const app = express()
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))

app.listen(process.env.PORT, () => {
    console.log(`Server is running on: http://localhost:${process.env.PORT}`)
})