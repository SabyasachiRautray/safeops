const asyncHandler = require("../middleware/asyncHandler");

// Generic list/get/create/update/delete handlers for a Sequelize model.
module.exports = (Model, { include = [], pick } = {}) => ({
  list: asyncHandler(async (req, res) => {
    const where = {};
    for (const k of ["plantId", "zoneId"]) if (req.query[k]) where[k] = req.query[k];
    res.json(await Model.findAll({ where, include, order: [["id", "DESC"]] }));
  }),
  get: asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id, { include });
    row ? res.json(row) : res.status(404).json({ error: "Not found" });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json(await Model.create(pick ? pick(req.body) : req.body));
  }),
  update: asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(await row.update(pick ? pick(req.body, true) : req.body));
  }),
  remove: asyncHandler(async (req, res) => {
    await Model.destroy({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
});
