async function createDeck(e) {
  e.preventDefault();

  const deckName = document.querySelector("#new-deck").value.trim();
  const response = await fetch("/api/decks/", {
    method: "POST",
    body: JSON.stringify({ name: deckName, cardList: [] }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    document.location.reload();
  } else {
    Toast.fire("Failed to create Deck");
  }
}

async function removeDeck(e) {
  e.preventDefault();

  const id = e.target.getAttribute("deck_id");
  const response = await fetch("/api/decks/delete", {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    document.location.reload();
  } else {
    await Toast.fire("Failed to delete Deck!");
  }
}

document.querySelector(".create-deck").addEventListener("submit", createDeck);
const removeDeckButtons = document.querySelectorAll(".remove-button");

removeDeckButtons.forEach((button) => {
  button.addEventListener("click", removeDeck);
});
