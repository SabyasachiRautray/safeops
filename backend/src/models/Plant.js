module.exports = (sequelize, DataTypes) => {
  const Plant = sequelize.define("Plant", {
    name: { type: DataTypes.STRING, allowNull: false },
    location: DataTypes.STRING,
  });

  Plant.associate = (db) => {
    Plant.hasMany(db.Zone, { foreignKey: "plantId", onDelete: "CASCADE" });
    Plant.hasMany(db.User, { foreignKey: "plantId" });
  };
  return Plant;
};
