const router = require("express").Router();
const c = require("../controllers/stats.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize("admin", "supervisor"), c.overview);
module.exports = router;
