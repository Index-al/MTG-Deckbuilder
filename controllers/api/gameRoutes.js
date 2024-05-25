const express = require('express');
const axios = require('axios');
const nlp = require('compromise');
const router = express.Router();

let currentCommander = null;  // Store the current commander card data

// Start game and fetch a random commander
router.get('/start-game', async (req, res) => {
    try {
        const { data } = await axios.get('https://api.scryfall.com/cards/random?q=is%3Acommander');
        currentCommander = data; // Store the commander card data
        res.json({
			success: true,
			message: `Game started! \n\nCurrent Commander: ${currentCommander.name}\n\nCommander Details:\nColors: ${currentCommander.color_identity}\nSet: ${currentCommander.set_name}\nRarity: ${currentCommander.rarity}\nType: ${currentCommander.type_line}\nPower/Toughness: ${currentCommander.power}/${currentCommander.toughness}\nCMC: ${currentCommander.cmc}\nReleased: ${currentCommander.released_at}\nArtists: ${currentCommander.artist}\n\nAsk a yes/no question to identify the commander!`,
			currentCommanderDetails: {
				released: currentCommander.released_at,
				cmc: currentCommander.cmc,
			},
		});

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error starting the game.' });
    }
});

// Check user's yes/no question
router.post('/ask-question', (req, res) => {
    if (!currentCommander) {
        return res.status(400).json({ success: false, message: "Game not started." });
    }

    const question = req.body.question;
    let answer = false;
    const doc = nlp(question.toLowerCase());

    // Check color identity
    currentCommander.color_identity.forEach(color => {
        if (doc.has(color.toLowerCase())) {
            answer = true;
        }
    });

    // Check set
    if (doc.has(currentCommander.set_name.toLowerCase()) || doc.has(currentCommander.set.toLowerCase())) {
        answer = true;
    }

    // Check rarity
    if (doc.has(currentCommander.rarity.toLowerCase())) {
        answer = true;
    }

    // Check specific abilities or keywords
    const keywords = ['flying', 'trample', 'haste', 'vigilance', 'deathtouch'];
    keywords.forEach(keyword => {
        if (doc.has(keyword) && currentCommander.oracle_text.toLowerCase().includes(keyword)) {
            answer = true;
        }
    });

    // Check for specific mana cost or CMC (Converted Mana Cost)
    if (doc.has('cmc ' + currentCommander.cmc) || doc.has(currentCommander.mana_cost)) {
        answer = true;
    }

    // Respond with the answer
    res.json({ success: true, answer });
});

module.exports = router;