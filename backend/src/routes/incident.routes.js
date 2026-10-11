const router = require("express").Router();
const c = require("../controllers/incident.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin", "supervisor"));
router.get("/", c.list);
router.post("/", c.create);
router.post("/:id/ack", c.acknowledge);
router.post("/:id/resolve", c.resolve);
module.exports = router;
