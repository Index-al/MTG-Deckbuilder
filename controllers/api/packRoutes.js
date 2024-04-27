const axios = require("axios");
const router = require("express").Router();

// Helper function to select random cards
function selectRandomCards(array, count) {
    // Shuffle the array using the Durstenfeld shuffle algorithm for better randomness
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  
    // Return a new array containing 'count' number of unique elements
    return array.slice(0, count);
  }
  
// Helper function to fetch all pages of cards if needed
const fetchAllCardsFromSet = async (setCode) => {
    let apiUrl = `https://api.scryfall.com/cards/search?q=set%3A${setCode}&unique=prints`;
    let allCards = [];
    try {
        while (apiUrl) {
            const response = await axios.get(apiUrl);
            allCards = allCards.concat(response.data.data);
            apiUrl = response.data.has_more ? response.data.next_page : null;
        }
        return allCards;
    } catch (error) {
        console.error('Error fetching all cards:', error);
        throw error;
    }
};

// Generate a random pack of cards from a specific set
router.get("/open-packs/:setCode", async (req, res) => {
    try {
        const setCode = req.params.setCode;
        const apiUrl = `https://api.scryfall.com/cards/search?q=set%3A${setCode}`;
        const response = await axios.get(apiUrl);
        let cards = response.data.data.filter(card => card.layout !== "planar");

        let commons = [], uncommons = [], raresAndMythics = [], lands = [], foils = [];
        cards.forEach(card => {
            if (card.layout === 'planar') return;
            if (card.type_line.includes('Land')) lands.push(card);
            else if (card.rarity === 'common') commons.push(card);
            else if (card.rarity === 'uncommon') uncommons.push(card);
            else if (card.rarity === 'rare' || card.rarity === 'mythic') raresAndMythics.push(card);
            if (card.foil) foils.push(card);
        });

        let pack = [];
        // 6-9 Common, 3-6 Uncommon, 1-4 Rare/Mythic, 1 Land (1 foil in 20% of packs)
        pack.push(...selectRandomCards(commons, 6 + Math.floor(Math.random() * 4)));
        pack.push(...selectRandomCards(uncommons, 3 + Math.floor(Math.random() * 4)));
        pack.push(...selectRandomCards(raresAndMythics, 1 + Math.floor(Math.random() * 4)));
        pack.push(...selectRandomCards(lands, 1));
        // Determine if the land should be foil
        if (Math.random() < 0.2) {
            pack.push(...selectRandomCards(foils, 1));
        }

        // Ensure the pack has exactly 14 cards
        while (pack.length > 14) {
            pack.pop();
        }
        while (pack.length < 14) {
            pack.push(...selectRandomCards(commons, 1)); // Add more commons if there's space
        }

        res.json(pack);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error simulating pack opening");
    }
});

module.exports = router;
