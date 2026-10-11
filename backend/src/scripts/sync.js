// Creates missing tables (no ALTER, so no duplicate-index problem).  Usage: npm run db:sync
// Add --force to DROP and recreate every table.
const db = require("../config/db");

(async () => {
  const force = process.argv.includes("--force");
  await db.sequelize.authenticate();
  await db.sequelize.sync({ force });
  console.log(force ? "✅ Tables recreated" : "✅ Tables ready");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
