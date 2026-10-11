const { Incident, Zone, Camera } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");
const { raiseIncident, refreshZoneStatus } = require("../services/incident.service");

exports.list = asyncHandler(async (req, res) => {
  const where = req.query.status ? { status: req.query.status } : {};
  res.json(await Incident.findAll({ where, include: [Zone, Camera], order: [["id", "DESC"]], limit: 200 }));
});

// manual / simulated incident (demo: fire in a zone -> siren on phones)
exports.create = asyncHandler(async (req, res) => {
  const { zoneId, type = "manual", severity, note } = req.body;
  const { incident } = await raiseIncident({ zoneId, type, severity, details: { note, by: req.user.name } });
  res.status(201).json(incident);
});

exports.acknowledge = asyncHandler(async (req, res) => {
  const i = await Incident.findByPk(req.params.id);
  await i.update({ status: "acknowledged", details: { ...(i.details || {}), ackBy: req.user.name } });
  res.json(i);
});

exports.resolve = asyncHandler(async (req, res) => {
  const i = await Incident.findByPk(req.params.id);
  await i.update({ status: "resolved", resolvedAt: new Date(), details: { ...(i.details || {}), resolvedBy: req.user.name } });
  await refreshZoneStatus(i.zoneId);
  res.json(i);
});
