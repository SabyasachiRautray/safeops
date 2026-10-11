module.exports = (sequelize, DataTypes) => {
  const AccessCheck = sequelize.define("AccessCheck", {
    decision: { type: DataTypes.ENUM("allowed", "denied"), allowNull: false },
    reason: DataTypes.STRING,
    required: DataTypes.JSON,
    detected: DataTypes.JSON,
    missing: DataTypes.JSON,
    evidence: DataTypes.STRING,
  });

  AccessCheck.associate = (db) => {
    AccessCheck.belongsTo(db.User, { foreignKey: "userId" });
    AccessCheck.belongsTo(db.Zone, { foreignKey: "zoneId" });
  };
  return AccessCheck;
};
