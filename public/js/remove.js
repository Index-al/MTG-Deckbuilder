async function removeFromCollection(e) {
  e.preventDefault();
  const key_id = e.target.getAttribute("card-id");
  const response = await fetch("/api/cards/update", {
    method: "DELETE",
    body: JSON.stringify({ key_id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    document.location.reload();
  } else {
    await Toast.fire("Failed to remove Card from Collection");
  }
}

const removeButtons = document.querySelectorAll(".remove");

removeButtons.forEach((button) => {
  button.addEventListener("click", removeFromCollection);
});

async function removeFromDeck(e) {
  e.preventDefault();
  const key_id = e.target.getAttribute("card-id");
  const response = await fetch("/api/deck-builder/update", {
    method: "DELETE",
    body: JSON.stringify({ key_id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    document.location.reload();
  } else {
    await Toast.fire("Failed to remove Card from Deck");
  }
};