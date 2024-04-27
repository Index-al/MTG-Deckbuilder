const router = require("express").Router();
const api = require("./api");
const homeRoutes = require("./homeRoute");


console.log("index controllers");

router.use("/", homeRoutes);
router.use("/api", api);


module.exports = router;