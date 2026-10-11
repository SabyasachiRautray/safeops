const { Zone, Plant } = require("../config/db");
module.exports = require("../utils/crudFactory")(Zone, { include: [Plant] });
