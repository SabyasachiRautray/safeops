const multer = require("multer");
// files stay in memory: they are forwarded to the AI service and saved as evidence
module.exports = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });
