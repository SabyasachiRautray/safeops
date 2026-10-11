const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { corsOrigin } = require("./config");
const { UPLOADS } = require("./services/evidence.service");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use("/uploads", express.static(UPLOADS));
app.use("/api", require("./routes"));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
