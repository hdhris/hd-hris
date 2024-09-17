import http from "http";
import prisma_server from "./prisma/prisma-server";
import { Server } from "socket.io";

const httpServer = http.createServer((req, res) => {
    // Define the routes
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("Server is running ...");
    } else {
        // Handle 404 Not Found
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end("404 Not Found");
    }
});

const corsOrigins = [
    process.env.CLIENT_URL ?? "http://localhost:3000",
    "http://localhost:3000",
]
console.log(`cors origins: `, corsOrigins)

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
    console.log(`socket.io server is running on port ${PORT}`);
    // await streamPlayerUpdates(io);
});

// async function streamPlayerUpdates(io: Server) {
//     try{
//         const stream = await prisma_server.sys_accounts.stream();
//         // Handle Prisma stream events
//         for await (const event of stream) {
//             console.log(`received event: `, event);
//
//             if (event.action === "update") {
//                 io.sockets.emit("update", event);
//             }
//         }
//     } catch (err){
//         console.log("Error while parsing: ", err)
//     }
//
// }