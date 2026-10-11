const { Op } = require("sequelize");
const { User, Zone, Camera, Incident, AccessCheck } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

exports.overview = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [workers, zones, cameras, openIncidents, zonesInAlert, allowedToday, deniedToday] = await Promise.all([
    User.count({ where: { role: "worker" } }), Zone.count(), Camera.count(),
    Incident.count({ where: { status: ["open", "acknowledged"] } }), Zone.count({ where: { status: "alert" } }),
    AccessCheck.count({ where: { decision: "allowed", createdAt: { [Op.gte]: today } } }),
    AccessCheck.count({ where: { decision: "denied", createdAt: { [Op.gte]: today } } }),
  ]);
  res.json({ workers, zones, cameras, openIncidents, zonesInAlert, allowedToday, deniedToday });
});
