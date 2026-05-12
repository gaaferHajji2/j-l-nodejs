const fs = require('fs')
const path = require('path')
const fastify = require('fastify')

const server = fastify({
    logger: true,
    http2: true,
    https: {
        key: fs.readFileSync(path.join(__dirname, 'tls', 'basic-private-key.key')),
        cert: fs.readFileSync(path.join(__dirname, '..', 'shared', 'tls', 'basic-certificate.cert'))
    },
});

server.get('/', async (request, reply) => {
    return { hello: 'world' };
});

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

console.log(`worker pid=${process.pid}`);

server.get('/recipes/:id', async (req, reply) => {
    console.log(`worker request pid=${process.pid}`);
    const id = Number(req.params.id);
    if (id !== 42) {
        reply.statusCode = 404;
        return { error: 'not_found' };
    }
    return {
        producer_pid: process.pid,
        recipe: {
            id, name: "Chicken Tikka Masala",
            steps: "Throw it in a pot...",
            ingredients: [
                { id: 1, name: "Chicken", quantity: "1 lb", },
                { id: 2, name: "Sauce", quantity: "2 cups", }
            ]
        }
    }
})

// Start the server on port 3000
server.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});