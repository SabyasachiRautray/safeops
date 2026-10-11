module.exports = (sequelize, DataTypes) => {
  const Zone = sequelize.define("Zone", {
    name: { type: DataTypes.STRING, allowNull: false },
    riskLevel: { type: DataTypes.ENUM("low", "medium", "high"), defaultValue: "medium" },
    // ---- per-zone safety logic ----
    requiredPpe: { type: DataTypes.JSON, defaultValue: ["helmet", "vest"] },
    fireCheck: { type: DataTypes.BOOLEAN, defaultValue: true },
    allowedRoles: { type: DataTypes.JSON, defaultValue: ["admin", "supervisor", "worker"] },
    // 'alert' = emergency lockdown, blocks all entry until incidents are resolved
    status: { type: DataTypes.ENUM("normal", "alert"), defaultValue: "normal" },
  });

  Zone.associate = (db) => {
    Zone.belongsTo(db.Plant, { foreignKey: "plantId" });
    Zone.hasMany(db.Camera, { foreignKey: "zoneId", onDelete: "CASCADE" });
    Zone.hasMany(db.User, { foreignKey: "zoneId" });
    Zone.hasMany(db.Incident, { foreignKey: "zoneId" });
    Zone.hasMany(db.AccessCheck, { foreignKey: "zoneId" });
  };
  return Zone;
};
