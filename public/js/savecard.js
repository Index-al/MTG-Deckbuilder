async function saveToCollection(e) {
  e.preventDefault();

	const id = e.target.getAttribute("card-id");
	const name = e.target.getAttribute("card-name");

	try {
		const response = await fetch("/api/cards/", {
			method: "POST",
			body: JSON.stringify({ id, name }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (response.ok) {
			await Toast.fire({
				icon: "success",
				title: "x1 " + name + " added to collection!",
        position: "top",
				width: 450,
			});

		} else {
			throw new Error({
        icon: "error",
        title: "Error: " + error.message,
      });
		}

	} catch (error) {
		await Toast.fire(error.message);
	}
}

const collectionButtonsSearch = document.querySelectorAll(
	".add-to-collection-search",
);

collectionButtonsSearch.forEach((button) => {
	button.addEventListener("click", saveToCollection);
});

const collectionButtons = document.querySelectorAll(
	".add-to-collection",
);

collectionButtons.forEach((button) => {
	button.addEventListener("click", saveToCollection);
});