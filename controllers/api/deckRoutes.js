const router = require("express").Router();
const { Deck } = require("../../models");
const withAuth = require("../../utils/auth");

router.post("/", withAuth, async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { name, cardList } = req.body;
    const newDeck = await Deck.create({
      user_id,
      name,
      cardList,
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

router.get("/:id", withAuth, async (req, res) => {
  try {
    const deck = await Deck.findOne({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    res.status(200).json(deck);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/", withAuth, async (req, res) => {
  try {
    const { id, cardList } = req.body;
    const updatedDeck = await Deck.update(
      { cardList },
      { where: { id, user_id: req.session.user_id } }
    );

    res.status(200).json(updatedDeck);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
