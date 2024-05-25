const { Deck } = require("../models");

const deckData = [
  {
    user_id: 1,
    name: "mydeck",
    cardList: [],
  },
  {
    user_id: 2,
    name: "mydeck",
    cardList: [],
  },
  {
    user_id: 3,
    name: "mydeck",
    cardList: [],
  },
];

const seedDecks = () => Deck.bulkCreate(deckData);

module.exports = seedDecks;
