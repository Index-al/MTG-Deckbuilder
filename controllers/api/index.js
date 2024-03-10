const router = require("express").Router();
const userRoutes = require("./userRoutes");
const cardRoutes = require("./cardRoutes");
const deckRoutes = require("./deckRoutes");
const packRoutes = require("./packRoutes");
// const collectionRoutes = require("./collectionRoutes");

router.use("/users", userRoutes);
router.use("/cards", cardRoutes);
router.use("/decks", deckRoutes);
router.use("/packs", packRoutes);
// router.use("/collection"), collectionRoutes;

module.exports = router;