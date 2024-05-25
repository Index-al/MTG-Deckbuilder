document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const deckId = urlParams.get('deckId');

  if (deckId) {
    // Load the deck
    const response = await fetch(`/api/decks/${deckId}`);
    if (response.ok) {
      const deckData = await response.json();
      loadDeck(deckData);
    }
  }
});

document.getElementById('card-search-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const cardName = document.getElementById('deck-search-input').value.trim();
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
        <button class="remove-card">Remove</button>
      `;
      stack.appendChild(cardElement);

      cardElement.querySelector('.remove-card').addEventListener('click', () => {
        cardElement.remove();
      });
    } else {
      alert('Invalid card name');
    }
  }
});

document.getElementById('save-deck-button').addEventListener('click', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const deckId = urlParams.get('deckId');

  const deckData = {
    id: deckId,
    cardList: []
  };

  document.querySelectorAll('.cardDeck').forEach(card => {
    deckData.cardList.push(card.querySelector('img').alt);
  });

  const response = await fetch(`/api/decks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deckData),
  });

  if (response.ok) {
    alert('Deck saved successfully');
  } else {
    alert('Failed to save deck');
  }
});

function loadDeck(deckData) {
  const deckView = document.getElementById('deck-view');
  deckData.cardList.forEach(async cardName => {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
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
        <button class="remove-card">Remove</button>
      `;
      stack.appendChild(cardElement);

      cardElement.querySelector('.remove-card').addEventListener('click', () => {
        cardElement.remove();
      });
    }
  });
}
