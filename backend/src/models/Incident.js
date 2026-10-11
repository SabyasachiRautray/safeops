module.exports = (sequelize, DataTypes) => {
  const Incident = sequelize.define("Incident", {
    type: { type: DataTypes.ENUM("fire", "smoke", "ppe_violation", "manual"), allowNull: false },
    severity: { type: DataTypes.ENUM("low", "medium", "high", "critical"), defaultValue: "high" },
    status: { type: DataTypes.ENUM("open", "acknowledged", "resolved"), defaultValue: "open" },
    evidence: DataTypes.STRING,
    details: DataTypes.JSON,
    resolvedAt: DataTypes.DATE,
  });

  Incident.associate = (db) => {
    Incident.belongsTo(db.Zone, { foreignKey: "zoneId" });
    Incident.belongsTo(db.Camera, { foreignKey: "cameraId" });
  };
  return Incident;
};
