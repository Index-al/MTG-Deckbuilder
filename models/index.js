const User = require("./user");
const Deck = require("./deck");
const Clipboard = require("./clipboard");
const Card = require("./card");
const Collection = require("./collection");

User.hasOne(Clipboard, {
  foreignKey: "user_id",
});
Clipboard.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasOne(Collection, {
  foreignKey: "user_id",
});
Collection.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(Deck, {
  foreignKey: "user_id",
});
Deck.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Collection.hasMany(Card, {
  foreignKey: "collection_id",
});
Card.belongsTo(Collection, {
  foreignKey: "collection_id",
  onDelete: "SET NULL",
});

Clipboard.hasMany(Card, {
  foreignKey: "clipboard_id",
});
Card.belongsTo(Clipboard, {
  foreignKey: "clipboard_id",
  onDelete: "SET NULL",
});

Deck.hasMany(Card, {
  foreignKey: "deck_id",
});
Card.belongsTo(Deck, {
  foreignKey: "deck_id",
  onDelete: "SET NULL",
});

module.exports = {
  User,
  Deck,
  Clipboard,
  Card,
  Collection,
};
