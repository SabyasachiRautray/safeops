// only admin/supervisor can read the people list; only admin can change it
module.exports = require("../utils/crudRouter")(require("../controllers/user.controller"), { read: ["admin", "supervisor"] });
