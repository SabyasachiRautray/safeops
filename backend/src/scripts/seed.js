// Drops + recreates tables, then inserts demo data.  Usage: npm run seed
const bcrypt = require("bcryptjs");
const { sequelize, Plant, Zone, Camera, User } = require("../config/db");

(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  const plant = await Plant.create({ name: "Bhubaneswar Steel Works", location: "Odisha" });
  const zones = await Zone.bulkCreate([
    { plantId: plant.id, name: "Welding Bay", riskLevel: "high", requiredPpe: ["helmet", "vest", "gloves", "goggles"], fireCheck: true },
    { plantId: plant.id, name: "Assembly Floor", riskLevel: "medium", requiredPpe: ["helmet", "vest"], fireCheck: true },
    { plantId: plant.id, name: "Admin Block", riskLevel: "low", requiredPpe: [], fireCheck: true },
  ]);
  await Camera.bulkCreate(zones.map((z) => ({ zoneId: z.id, name: `${z.name} Cam 1`, type: "webcam" })));

  const h = (p) => bcrypt.hashSync(p, 10);
  await User.bulkCreate([
    { name: "Admin", email: "admin@safeops.com", passwordHash: h("admin123"), role: "admin", plantId: plant.id },
    { name: "Supervisor Rao", email: "super@safeops.com", passwordHash: h("super123"), role: "supervisor", plantId: plant.id, zoneId: zones[0].id },
    { name: "Ravi Kumar", email: "ravi@safeops.com", passwordHash: h("worker123"), role: "worker", employeeCode: "EMP-001", plantId: plant.id, zoneId: zones[0].id },
    { name: "Anita Das", email: "anita@safeops.com", passwordHash: h("worker123"), role: "worker", employeeCode: "EMP-002", plantId: plant.id, zoneId: zones[1].id },
  ]);
  console.log("✅ Seeded.  admin@safeops.com / admin123");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
