document.getElementById('card-search-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const cardName = document.getElementById('card-search-input').value.trim();
  const deckView = document.getElementById('deck-view');

  if (cardName) {
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);

    if (response.ok) {
      const cardData = await response.json();
      const cardTypes = cardData.type_line.toLowerCase().split(' ');

      let primaryType = cardTypes.includes('creature') ? 'creature' :
                        cardTypes.includes('planeswalker') ? 'planeswalker' :
                        cardTypes[0];

      let stack = document.querySelector(`.card-stack[data-type="${primaryType}"]`);
      if (!stack) {
        stack = document.createElement('div');
        stack.classList.add('card-stack');
        stack.dataset.type = primaryType;
        stack.innerHTML = `<h3>${primaryType.charAt(0).toUpperCase() + primaryType.slice(1)}</h3>`;
        deckView.appendChild(stack);
      }

      const cardElement = document.createElement('div');
      cardElement.classList.add('cardDeck');
      cardElement.style.top = `${stack.children.length * 30}px`; // Offset each card by 30px
      cardElement.innerHTML = `
        <img src="${cardData.image_uris.normal}" alt="${cardData.name}">
        <div>Price: $${cardData.prices.usd}</div>
      `;
      stack.appendChild(cardElement);
    } else {
      alert('Invalid card name');
    }
  }
});

document.getElementById('card-type-filter').addEventListener('change', function() {
  const filterValue = this.value;
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    if (filterValue === 'all' || card.dataset.type === filterValue) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});
