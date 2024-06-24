const http = require('http');
const cluster = require('cluster');
const app = require('./app');
const os = require('os');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}........`);
    });
}

if (cluster.isMaster) {
    console.log(`Master process has started........`);
    const NUM_WORKERS = os.cpus().length;
    console.log(`Number of workers is: ${NUM_WORKERS}`);
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }
} else {
    console.log(`Worker process has started........`);
    startServer();
}
