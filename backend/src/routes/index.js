const router = require("express").Router();

router.get("/health", (_, res) => res.json({ ok: true }));
router.use("/auth", require("./auth.routes"));
router.use("/plants", require("./plant.routes"));
router.use("/zones", require("./zone.routes"));
router.use("/cameras", require("./camera.routes"));
router.use("/users", require("./user.routes"));
router.use("/incidents", require("./incident.routes"));
router.use("/checkpoint", require("./checkpoint.routes"));
router.use("/monitor", require("./monitor.routes"));
router.use("/stats", require("./stats.routes"));
module.exports = router;
