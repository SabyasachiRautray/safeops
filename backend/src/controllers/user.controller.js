const bcrypt = require("bcryptjs");
const { User, Zone } = require("../config/db");

// whitelist fields + hash password
const pick = (b, partial) => {
  const o = {
    name: b.name, email: b.email, role: b.role, employeeCode: b.employeeCode,
    plantId: b.plantId || null, zoneId: b.zoneId || null, active: b.active,
  };
  if (b.password) o.passwordHash = bcrypt.hashSync(b.password, 10);
  else if (!partial) o.passwordHash = bcrypt.hashSync("changeme123", 10);
  Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]);
  return o;
};

module.exports = require("../utils/crudFactory")(User, { include: [Zone], pick });
