const http = require('http');

const PORT = 3001;
const HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message: "Hello from Node Instance #2 (Port 3001)",
        port: PORT,
        url: req.url,
        timestamp: new Date().toISOString()
    }));
});

server.listen(PORT, HOST, () => {
    console.log(`Node Server #2 running internally on http://${HOST}:${PORT}`);
});

