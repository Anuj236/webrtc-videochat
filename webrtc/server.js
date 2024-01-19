import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: '/webrtc-video-chat'
});

const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Hey!!");
});

const webRTCNamespace = io.of('/webRTCPeers');


webRTCNamespace.on('connection', (socket) => {
  
  console.log(socket.id)
  socket.on("error",(error)=> {
    console.error(`Connection Error : ${error}`)
  })

  socket.emit("connection-success", {
    status: "connection-success",
    socketId: socket.id
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} has disconnected`);
  });

  socket.on('sdp', (data) => {
    console.log(data);
    socket.broadcast.emit('sdp', data);
  });

  socket.on('candidate', (data) => {
    socket.broadcast.emit('candidate', data);
  });
});

server.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
  });
