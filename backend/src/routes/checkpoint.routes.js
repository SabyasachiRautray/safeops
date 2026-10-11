const router = require("express").Router();
const c = require("../controllers/checkpoint.controller");
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");

router.post("/verify", authenticate, upload.single("file"), c.verify);
router.get("/history", authenticate, c.history);
module.exports = router;
