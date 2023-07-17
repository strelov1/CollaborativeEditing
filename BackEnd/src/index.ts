import http from "http";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { ClientToServerEvents, ServerToClientEvents } from "./models/SocketEvents";
import { getNodes } from "./components/node/node.service";
import { addNodeExclusive, removeNodeExclusive } from "./handlers/node";

dotenv.config();

const app = express();

const { PORT, MONGODB_PRIMARY_HOST, MONGODB_PORT, MONGODB_DATABASE } =
  process.env;

const dbUrl = `mongodb://${MONGODB_PRIMARY_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;

mongoose.connect(dbUrl);
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${dbUrl}`);
});

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", async (socket) => {
  getNodes().then((data) => io.emit("nodes", data));

  socket.on("addNode", (prevNodeId) =>
    addNodeExclusive(prevNodeId).then((data) => io.emit("nodeAdded", data))
  );

  socket.on("removeNode", (nodeId) =>
    removeNodeExclusive(nodeId).then((data) => io.emit("nodeRemoved", data))
  );
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
