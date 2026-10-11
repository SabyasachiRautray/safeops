const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret, badgeSecret } = require("../config");
const { User, Zone, Plant } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, role: u.role,
  employeeCode: u.employeeCode, zoneId: u.zoneId, plantId: u.plantId,
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !user.active || !(await bcrypt.compare(password || "", user.passwordHash)))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: "12h" });
  res.json({ token, user: publicUser(user) });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: [Zone, Plant] });
  res.json({ ...publicUser(user), zone: user.Zone, plant: user.Plant });
});

// ID-card QR payload, valid 90s. The mobile app refreshes it every minute,
// so a screenshot of someone's QR is useless.
exports.badge = (req, res) => {
  const badgeToken = jwt.sign({ sub: req.user.id, type: "badge" }, badgeSecret, { expiresIn: 90 });
  res.json({ badgeToken, expiresIn: 90 });
};
