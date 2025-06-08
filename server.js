/** @format */

import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const userMaps = {}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // ⚠️ Change this to your frontend domain in production!
      methods: ["GET", "POST"],
    },
  });


  io.on("connection", (socket) => {
    socket.on("register", (id) => {
      userMaps[id] = socket.id;
    });
    socket.on("privateMessage", ({to, message}) =>{
      const currentUser = userMaps[to];
      if(currentUser){
        io.to(currentUser).emit("receivePrivateMessage", {
        message,
      });
      }
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
