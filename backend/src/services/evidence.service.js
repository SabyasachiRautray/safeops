const fs = require("fs");
const path = require("path");

const UPLOADS = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOADS, { recursive: true });

exports.UPLOADS = UPLOADS;
exports.saveEvidence = (file, prefix = "ev") => {
  if (!file) return null;
  const ext = (file.originalname || "").split(".").pop() || "jpg";
  const name = `${prefix}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS, name), file.buffer);
  return `/uploads/${name}`;
};
