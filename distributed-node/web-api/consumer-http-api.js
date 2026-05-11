const server = require('fastify')({
    logger: true
})
const fetch = require('node-fetch').default
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'
const TARGET = process.env.TARGET || 'localhost:4000'

server.get('/', async () => {
    const req = await fetch(`http://${TARGET}/recipes/42`);
    const producer_data = await req.json();

    return {
        consumer_pid: process.pid,
        producer_data
    };
})

server.listen({ host: HOST, port: PORT}, (err, address) => {
    console.log(`Consumer running on: ${address}`)
})