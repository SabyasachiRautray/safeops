const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { jwtSecret, corsOrigin } = require("../config");
const { User, Zone } = require("../config/db");

let io;

exports.init = (server) => {
  io = new Server(server, { cors: { origin: corsOrigin } });

  io.use(async (socket, next) => {
    try {
      const p = jwt.verify(socket.handshake.auth.token, jwtSecret);
      socket.user = await User.findByPk(p.sub);
      next();
    } catch { next(new Error("unauthorized")); }
  });

  io.on("connection", async (socket) => {
    const u = socket.user;
    socket.join(`user:${u.id}`);
    if (u.role !== "worker") socket.join("admins");
    if (u.zoneId) {
      socket.join(`zone:${u.zoneId}`);
      // late joiner: zone already in alert -> siren straight away
      const z = await Zone.findByPk(u.zoneId);
      if (z && z.status === "alert")
        socket.emit("zone:alert", { zoneId: z.id, zoneName: z.name, type: "fire", message: "Active emergency in your zone" });
    }
  });
  return io;
};

exports.getIO = () => io;
