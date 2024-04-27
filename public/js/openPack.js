// public/js/openPacks.js
document.addEventListener("DOMContentLoaded", async function () {
    console.log("Attempting to populate set options..");
	await fetchSetsAndPopulateSelector();
});


// Fetch sets from Scryfall and populate selector
function fetchSetsAndPopulateSelector() {
    console.log("Within fetchSetsAndPopulateSelector()!");

    fetch("https://api.scryfall.com/sets")
        .then((response) => response.json())
        .then((data) => {
            const select = document.getElementById("set-selector");

            data.data.forEach((set) => {
                // Add additional condition to check card_count
                if (
                    set.card_count > 285 &&
                    !set.name.includes("Tokens") &&
                    !set.name.includes("Art Series") &&
                    !set.name.endsWith("Commander") &&
                    !set.name.includes("Promos") &&
                    !set.name.includes("Front Cards") &&
                    !set.name.includes("Minigames") &&
                    !set.name.includes("Substitute Cards") &&
                    !set.name.includes("Oversized") &&
                    !set.name.includes("Experience") &&
                    !set.name.includes("Display Commanders") &&
                    !set.name.includes("Standard Showdown") &&
                    !set.name.includes("Duel Decks") &&
                    !set.name.includes("Decks") &&
                    !set.name.includes("Secret Lair") &&
                    !set.name.includes("Retro Artifacts") &&
                    !set.name.includes("Game Night") &&
                    !set.name.includes("Sticker Sheets") &&
                    !set.name.includes("Mystical Archive") &&
                    !set.name.includes("Arena Exclusives") &&
                    !set.name.includes("Gift Cards") &&
                    !set.name.includes("From The Vault") &&
                    !set.name.includes("Comic-Con") &&
                    !set.name.includes("Signature Spellbook")
                ) {
                    const option = document.createElement("option");
                    option.value = set.code;
                    option.textContent = set.name;
                    select.appendChild(option);
                }
            });

            console.log("Sets fetched and selector populated!");
        })
        .catch((error) => console.error("Error fetching sets:", error));
}



// Function to display the opened pack
function displayPack(pack) {
    const container = document.getElementById('pack-display-container');
    container.innerHTML = ''; // Clear previous pack

    // Flatten the pack array if it's nested
    const flatPack = pack.flat();

    console.log("Flattened pack array:", flatPack); // This should help us verify the structure

    flatPack.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('pack-card');

        const img = document.createElement('img');
        // Adjust for double-faced cards or other special layouts
        if (card.image_uris) {
            img.src = card.image_uris.normal;
        } else if (card.card_faces && card.card_faces.length > 0) {
            img.src = card.card_faces[0].image_uris.normal;
        } else {
            console.error("Card does not have an image URI:", card);
        }
        img.alt = card.name;

        cardElement.appendChild(img);
        container.appendChild(cardElement);
    });
}

// Event listener for when a user selects a set and clicks the open pack button
document.getElementById('open-pack-btn').addEventListener('click', function() {
    let setCode = document.getElementById('set-selector').value;
    fetch(`/open-packs/${setCode}`)
        .then(response => response.json())
        .then(pack => {
            displayPack(pack); // Function to display cards on the page
        });
});