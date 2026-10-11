const { Camera, Zone } = require("../config/db");
module.exports = require("../utils/crudFactory")(Camera, { include: [Zone] });
