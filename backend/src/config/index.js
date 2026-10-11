require("dotenv").config();

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-access",
  badgeSecret: process.env.BADGE_SECRET || "dev-badge",
  aiUrl: process.env.AI_URL || "http://localhost:8000",
  // asks your api.py to run the Ollama second check (only works if LLM_BACKEND=ollama there)
  useLlm: process.env.AI_USE_LLM !== "false",
  corsOrigin: (process.env.CORS_ORIGIN || "*").split(","),
  ROLES: ["admin", "supervisor", "worker"],
  PPE_TYPES: ["helmet", "vest", "gloves", "goggles", "boots"],
};
