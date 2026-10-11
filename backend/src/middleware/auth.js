const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const { User } = require("../config/db");

exports.authenticate = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(payload.sub);
    if (!user || !user.active) return res.status(401).json({ error: "Account disabled" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.authorize = (...allowed) => (req, res, next) =>
  allowed.includes(req.user.role) ? next() : res.status(403).json({ error: "Forbidden" });
