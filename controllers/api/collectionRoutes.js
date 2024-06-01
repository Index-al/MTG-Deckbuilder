const router = require("express").Router();
const { Collection } = require("../../models");
const withAuth = require("../../utils/auth");

// Route to delete a user's collection
router.delete("/delete", withAuth, async (req, res) => {
    try {
      const user_id = req.session.user_id;
      const collectionId = req.body.collectionId;
  
      await Collection.destroy({
        where: {
          id: collectionId,
          user_id: user_id
        }
      });
  
      res.status(200).json("Collection deleted");
    } catch (err) {
      res.status(400).json(err);
    }
  });

module.exports = router;