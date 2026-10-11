const http = require("http");
const { port } = require("./config");
require("./config/db"); // connects to MySQL and loads all models
const app = require("./app");
const socket = require("./sockets");

const server = http.createServer(app);
socket.init(server);
server.listen(port, "0.0.0.0", () => console.log(`🚀 SafeOps API on :${port}`));
