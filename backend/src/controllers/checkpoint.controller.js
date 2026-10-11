const jwt = require("jsonwebtoken");
const { badgeSecret } = require("../config");
const { User, Zone, AccessCheck } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");
const { analyze, evalPpe } = require("../services/ai.service");
const { raiseIncident } = require("../services/incident.service");
const { saveEvidence } = require("../services/evidence.service");
const socket = require("../sockets");

// Who is being checked? badge QR > explicit userId (staff demo mode) > the caller himself
async function resolveSubject(req) {
  const { badgeToken, userId } = req.body;
  if (badgeToken) {
    const p = jwt.verify(badgeToken, badgeSecret); // throws if expired / forged
    if (p.type !== "badge") throw new Error("Invalid badge");
    return User.findByPk(p.sub);
  }
  if (userId && req.user.role !== "worker") return User.findByPk(userId);
  return req.user;
}

exports.verify = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image or video required" });

  let subject;
  try { subject = await resolveSubject(req); }
  catch (e) { return res.status(400).json({ error: e.message === "jwt expired" ? "QR expired — refresh your ID" : "Invalid QR" }); }

  const zone = await Zone.findByPk(req.body.zoneId);
  if (!subject || !subject.active) return res.status(404).json({ error: "Employee not found or disabled" });
  if (!zone) return res.status(404).json({ error: "Zone not found" });

  const required = zone.requiredPpe || [];
  const evidence = saveEvidence(req.file, "chk");
  const out = {
    user: { id: subject.id, name: subject.name, role: subject.role, employeeCode: subject.employeeCode },
    zone: { id: zone.id, name: zone.name, riskLevel: zone.riskLevel },
    required, detected: [], missing: [], unverified: [], fire: false, evidence,
  };

  const deny = async (reason) => {
    out.decision = "denied"; out.reason = reason;
    await AccessCheck.create({ userId: subject.id, zoneId: zone.id, decision: "denied", reason, required, detected: out.detected, missing: out.missing, evidence });
    return res.json(out);
  };

  // ---- hard rules first (no AI needed) ----
  if (zone.status === "alert") return deny("Zone is under emergency lockdown");
  if (!(zone.allowedRoles || []).includes(subject.role)) return deny(`Role "${subject.role}" not permitted in this zone`);

  // ---- AI checks: one call to the FastAPI service (PPE + fire) ----
  if (required.length || zone.fireCheck) {
    const ai = await analyze(req.file, { ppe: required.length > 0, fire: zone.fireCheck });
    out.annotated = ai.annotated;

    if (zone.fireCheck && ai.fire) {
      out.fire = true;
      await raiseIncident({ zoneId: zone.id, type: ai.fireType === "smoke" ? "smoke" : "fire", details: { source: "checkpoint", user: subject.name }, evidence });
      return deny(`${ai.fireType.toUpperCase()} detected near checkpoint — entry blocked`);
    }
    if (required.length) {
      const ev = evalPpe(ai.frames, required);
      Object.assign(out, { detected: ev.detected, missing: ev.missing, unverified: ev.unverified });
      if (!ev.personFound) return deny("No person detected — stand in front of the camera");
      if (ev.missing.length) return deny(`Missing PPE: ${ev.missing.join(", ")}`);
      if (!ev.ok) return deny(`Could not verify: ${ev.unverified.join(", ")} — make sure it is clearly visible`);
    }
  }

  out.decision = "allowed"; out.reason = "All required PPE detected";
  await AccessCheck.create({ userId: subject.id, zoneId: zone.id, decision: "allowed", reason: out.reason, required, detected: out.detected, missing: [], evidence });
  // once inside, the worker's phone joins that zone's alert room
  const io = socket.getIO();
  if (io) io.in(`user:${subject.id}`).socketsJoin(`zone:${zone.id}`);
  res.json(out);
});

exports.history = asyncHandler(async (req, res) => {
  const where = req.user.role === "worker" ? { userId: req.user.id } : {};
  res.json(await AccessCheck.findAll({ where, include: [User, Zone], order: [["id", "DESC"]], limit: 100 }));
});
