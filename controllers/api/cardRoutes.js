const router = require("express").Router();
const { Card } = require("../../models");
const withAuth = require("../../utils/auth");

router.post("/", withAuth, async (req, res) => {
  try {
    const collection_id = req.session.user_id;
    const name = req.body.name;
    const id = req.body.id;
    const newCard = await Card.create({
      collection_id,
      name,
      id,
    });
    res.status(200).json(newCard);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete("/update", withAuth, async (req, res) => {
  try {
    const removedCard = await Card.destroy({
      where: {
        key_id: req.body.key_id,
      },
    });

    res.status(200).json(removedCard);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
