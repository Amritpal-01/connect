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

    // WebRTC signaling handlers
    socket.on("offer", ({ offer, to, from }) => {
      const targetUser = userMaps[to];
      if (targetUser) {
        io.to(targetUser).emit("recieveOffer", { offer, from });
      }
    });

    socket.on("answer", ({ answer, to, from }) => {
      const targetUser = userMaps[to];
      if (targetUser) {
        io.to(targetUser).emit("receiveAnswer", { answer, from });
      }
    });

    socket.on("ice-candidate", ({ candidate, to, from }) => {
      const targetUser = userMaps[to];
      if (targetUser) {
        io.to(targetUser).emit("ice-candidate", { candidate, from });
      }
    });

    socket.on("disconnect", () => {
      // Remove user from userMaps when they disconnect
      const userId = Object.keys(userMaps).find(key => userMaps[key] === socket.id);
      if (userId) {
        delete userMaps[userId];
      }
    });
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
