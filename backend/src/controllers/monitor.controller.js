const { Camera, Zone } = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");
const { analyze, evalPpe } = require("../services/ai.service");
const { raiseIncident } = require("../services/incident.service");
const { saveEvidence } = require("../services/evidence.service");

// Camera frame (webcam loop or uploaded demo file) -> fire/smoke + PPE overview
exports.frame = asyncHandler(async (req, res) => {
  const cam = await Camera.findByPk(req.body.cameraId, { include: [Zone] });
  if (!cam || !req.file) return res.status(400).json({ error: "cameraId and file required" });

  const zone = cam.Zone;
  const required = zone.requiredPpe || [];
  const ai = await analyze(req.file, { ppe: required.length > 0, fire: zone.fireCheck });

  const result = { cameraId: cam.id, zoneId: zone.id, fire: false, annotated: ai.annotated, ppeMissing: [] };
  if (required.length) {
    const ev = evalPpe(ai.frames, required);
    result.ppeMissing = [...ev.missing, ...ev.unverified];
  }
  if (zone.fireCheck && ai.fire) {
    result.fire = true;
    const r = await raiseIncident({
      zoneId: zone.id, cameraId: cam.id, type: ai.fireType === "smoke" ? "smoke" : "fire",
      evidence: saveEvidence(req.file, "fire"),
    });
    result.incidentId = r.incident.id;
  }
  res.json(result);
});
