const router = require("express").Router();
const sequelize = require("../config/connection");
const { User, Card, Deck, Collection } = require("../models");
const withAuth = require("../utils/auth");
const { QueryTypes } = require("sequelize");
const axios = require("axios");
const { promisify } = require("util");
const setTimeoutAsync = promisify(setTimeout);
const express = require("express");

// Helper function to get a random card from Scryfall API
const getRandomCard = async () => {
  try {
    const response = await axios.get("https://api.scryfall.com/cards/random");
    const card = response.data;
    return {
      name: card.name,
      set: card.set_name,
      imageUrl: card.image_uris ? card.image_uris.normal : "", // Fallback in case there's no image
    };
  } catch (error) {
    console.error("Error fetching random card:", error);
    return null;
  }
};

router.get("/", async (req, res) => {
  try {
    // Fetch 3 random cards
    const randomCardPromises = [
      getRandomCard(),
      getRandomCard(),
      getRandomCard(),
    ];

    // Wait for all promises to resolve
    const featuredCards = await Promise.all(randomCardPromises);

    // Filter out any null results in case of API fetching errors
    const validFeaturedCards = featuredCards.filter((card) => card != null);

    // Pass the data to the template
    res.render("homepage", {
      title: "Homepage",
      logged_in: req.session.logged_in,
      featuredCards: validFeaturedCards,
      hide_search: true,
    });
  } catch (err) {
    console.error("Error while fetching featured cards:", err);
    res.status(500).json(err);
  }
});

router.get("/login", (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    // Make sure session data is refreshed
    res.redirect("/my-decks");
    return;
  }

  res.render("login", {
    title: "Login",
    hide_search: true, // Don't show search bar on login page
  });
});

router.get("/my-decks", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID

    const deckData = await Deck.findAll({
      where: { user_id: req.session.user_id },
    });
    const decks = [];
    for (let i = 0; i < deckData.length; i++) {
      decks.push(deckData[i].dataValues);
    }
    console.log(decks);
    res.render("my-decks", {
      title: "My Decks",
      decks,
      logged_in: true,
      hide_search: false,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/deck-builder", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
    });

    const user = userData.get({ plain: true });
    res.render("deck-builder", {
      title: "Deck Builder",
      ...user,
      logged_in: true,
      hide_search: false,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/open-packs", async (req, res) => {
  let logged_in = false;
  if (req.session.logged_in) {
    logged_in = true;
  }
  res.render("open-packs", {
    logged_in,
  });
});

router.get("/collection", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const collectionData = await Card.findAll({
      include: [
        {
          model: Collection,
        },
      ],
      order: [["name", "ASC"]],
    });

    const dataFiltered = collectionData.filter(
      (card) => card.dataValues.collection_id === req.session.user_id
    );
    scryfallObjData = [];

    for (let i = 0; i < dataFiltered.length; i++) {
      const apiUrl = `https://api.scryfall.com/cards/${dataFiltered[i].dataValues.id}`;
      setTimeoutAsync(50);
      
      const response = await axios.get(apiUrl);


      const cardData = response.data;
      cardData.key_id = dataFiltered[i].key_id;
      scryfallObjData.push(cardData);
    }
    for (let i = 0; i < scryfallObjData.length; i++) {
      scryfallObjData[i].name = scryfallObjData[i].name.replace(/\/\//g, "");

      if (!scryfallObjData[i].image_uris) {
        scryfallObjData[i].image_uris =
          scryfallObjData[i].card_faces[0].image_uris;
      }
    }
    console.log("Attempting to render collection..");
    res.render("collection", {
      scryfallObjData,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
    console.log("Error fetching collection data:", err);
  }
});

// Route to handle searching all cards
router.get("/search-result/:searchText", async (req, res) => {
  const cardSearch = req.params.searchText;
  try {
    const apiUrl = `https://api.scryfall.com/cards/search?q=${cardSearch}`;
    const response = await axios.get(apiUrl).catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
        return;
      } else if (error.request) {
        console.log("ERROR: ", error.message);
      }
    });

    const cardData = response.data.data;
    // console.log(cardData[3].image_uris.normal);

    for (let i = 0; i < cardData.length; i++) {
      if (!cardData[i].image_uris) {
        cardData[i].image_uris = cardData[i].card_faces[0].image_uris;
      }
    }
    let logged_in = false;
    if (req.session.logged_in) {
      logged_in = true;
    }
    let decks = [];
    if (logged_in) {
      const deckData = await Deck.findAll({
        where: {
          user_id: req.session.user_id,
        },
      });
      decks = deckData.map((deck) => deck.get({ plain: true }));
    }

    res.render("search-result", {
      cardData,
      decks,
      logged_in,
    });
  } catch (error) {
    console.log("error: ", error);

    let logged_in = false;
    if (req.session.logged_in) {
      logged_in = true;
    }

    res.status(404).render("no-results", {
			error: error,
      logged_in,
		});
  }
});

// Route to handle individual card details page
router.get("/search/:cardName", async (req, res) => {
  const cardName = req.params.cardName;

  try {
    // Use the 'exact' parameter for an exact name match
    const apiUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
      cardName
    )}`;
    const response = await axios.get(apiUrl);
    const cardData = response.data;

    let logged_in = false;
    if (req.session.logged_in) {
      logged_in = true;
    }
    let decks = [];
    if (logged_in) {
      const deckData = await Deck.findAll({
        where: {
          user_id: req.session.user_id,
        },
      });
      decks = deckData.map((deck) => deck.get({ plain: true }));
    }
    // Render card template with the fetched data
    res.render("card", {
      card: cardData,
      logged_in,
      title: "Card Details",
      hide_search: false,
      decks,
    });
  } catch (error) {
    // If the card is not found, Scryfall API will return a 404 status
    if (error.response && error.response.status === 404) {
      res.status(404).send("Card not found");
    } else {
      console.error(error);
      res.status(500).send("Error retrieving card data");
    }
  }
});

router.get("/account", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
    });

    const user = userData.get({ plain: true });
    res.render("account", {
      title: "Account",
      ...user,
      logged_in: true,
      hide_search: false,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/reset-password", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID

    res.render("reset-password", {
      title: "Reset Password",
      logged_in: true,
      hide_search: false,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/search-result/", async (req, res) => {
  let logged_in = false;
  if (req.session.logged_in) {
    logged_in = true;
  }
  res.render("no-results", {
    logged_in,
  });
});

module.exports = router;
