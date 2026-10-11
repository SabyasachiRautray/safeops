const router = require("express").Router();
const c = require("../controllers/monitor.controller");
const upload = require("../middleware/upload");
const { authenticate, authorize } = require("../middleware/auth");

router.post("/frame", authenticate, authorize("admin", "supervisor"), upload.single("file"), c.frame);
module.exports = router;
