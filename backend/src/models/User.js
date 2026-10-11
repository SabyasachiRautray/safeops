module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "supervisor", "worker"), defaultValue: "worker" },
    employeeCode: DataTypes.STRING,
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  // never leak the password hash in API responses
  User.prototype.toJSON = function () {
    const v = { ...this.get() };
    delete v.passwordHash;
    return v;
  };

  User.associate = (db) => {
    User.belongsTo(db.Plant, { foreignKey: "plantId" });
    User.belongsTo(db.Zone, { foreignKey: "zoneId" }); // home zone
    User.hasMany(db.AccessCheck, { foreignKey: "userId" });
  };
  return User;
};
