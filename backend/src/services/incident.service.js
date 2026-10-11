const { Incident, Zone } = require("../config/db");
const socket = require("../sockets");

// Creates an incident, locks the zone (fire/smoke) and notifies dashboards + phones in that zone.
exports.raiseIncident = async ({ zoneId, cameraId = null, type, severity, details = {}, evidence = null }) => {
  const critical = type === "fire" || type === "smoke";
  const existing = await Incident.findOne({ where: { zoneId, type, status: ["open", "acknowledged"] } });
  if (existing) return { incident: existing, created: false };

  const incident = await Incident.create({
    zoneId, cameraId, type, details, evidence,
    severity: severity || (critical ? "critical" : "medium"),
  });
  const zone = await Zone.findByPk(zoneId);
  if (critical) await zone.update({ status: "alert" });

  const payload = {
    incidentId: incident.id, zoneId, zoneName: zone.name, type, severity: incident.severity,
    message: critical ? `${type.toUpperCase()} detected in ${zone.name}. Evacuate!` : `Incident in ${zone.name}`,
  };
  const io = socket.getIO();
  if (io) {
    io.to("admins").emit("incident:new", payload);
    if (critical) io.to(`zone:${zoneId}`).emit("zone:alert", payload); // -> siren on phones
  }
  return { incident, created: true };
};

// When no fire/smoke incident is left open, release the lockdown and stop the sirens.
exports.refreshZoneStatus = async (zoneId) => {
  const open = await Incident.count({ where: { zoneId, type: ["fire", "smoke"], status: ["open", "acknowledged"] } });
  if (open) return;
  await Zone.update({ status: "normal" }, { where: { id: zoneId } });
  const io = socket.getIO();
  if (io) {
    io.to(`zone:${zoneId}`).emit("zone:clear", { zoneId });
    io.to("admins").emit("zone:clear", { zoneId });
  }
};
