const router = require("express").Router();
const { Deck } = require("../../models");
const withAuth = require("../../utils/auth");

router.post("/", withAuth, async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const name = req.body.deckName;
    const newDeck = await Deck.create({
      user_id,
      name,
    });

    res.status(200).json(newDeck);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/delete", withAuth, async (req, res) => {
  try {
    const removedDeck = await Deck.destroy({
      where: {
        id: req.body.id,
      },
    });

    res.status(200).json(removedDeck);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
