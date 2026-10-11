module.exports = (sequelize, DataTypes) => {
  const Camera = sequelize.define("Camera", {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("webcam", "rtsp", "upload"), defaultValue: "webcam" },
    streamUrl: DataTypes.STRING,
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  Camera.associate = (db) => {
    Camera.belongsTo(db.Zone, { foreignKey: "zoneId" });
    Camera.hasMany(db.Incident, { foreignKey: "cameraId" });
  };
  return Camera;
};
