import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 }); // Port for WebSocket server

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    // Example: Send a test notification
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    ws.on('message', (message: string) => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:3001');
