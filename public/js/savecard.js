async function saveToCollection(e) {
  e.preventDefault();
  const id = e.target.getAttribute("card-id");
  const name = e.target.getAttribute("card-name");

  const response = await fetch("/api/cards/", {
    method: "POST",
    body: JSON.stringify({ id, name }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    await Toast.fire("Card Added to Collection!");
  } else {
    await Toast.fire("Failed to add Card to Collection!");
  }
}

const collectionButtons = document.querySelectorAll(".collection");

collectionButtons.forEach((button) => {
  button.addEventListener("click", saveToCollection);
});
