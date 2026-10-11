const router = require("express").Router;
const { authenticate, authorize } = require("../middleware/auth");

// Builds /, /:id routes from a crud controller. Reads: any logged-in user (or `read` roles). Writes: admin.
module.exports = (c, { read = null, write = ["admin"] } = {}) => {
  const r = router();
  const canRead = read ? [authenticate, authorize(...read)] : [authenticate];
  const canWrite = [authenticate, authorize(...write)];
  r.get("/", canRead, c.list);
  r.get("/:id", canRead, c.get);
  r.post("/", canWrite, c.create);
  r.put("/:id", canWrite, c.update);
  r.delete("/:id", canWrite, c.remove);
  return r;
};
