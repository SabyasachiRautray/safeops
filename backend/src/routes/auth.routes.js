const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const c = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), c.login);
router.get("/me", authenticate, c.me);
router.get("/badge", authenticate, c.badge);
module.exports = router;
