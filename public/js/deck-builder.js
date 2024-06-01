document.addEventListener('DOMContentLoaded', async () => {
  await populateDeckSelector();

  const urlParams = new URLSearchParams(window.location.search);
  const deckId = urlParams.get('deckId');

  if (deckId) {
    // Load the deck
    await loadDeck(deckId);
    toggleDeckControls(true);
  }
});

async function populateDeckSelector() {
  const response = await fetch('/api/decks');
  if (response.ok) {
    const decks = await response.json();
    const deckSelector = document.getElementById('deck-selector');
    decks.forEach(deck => {
      const option = document.createElement('option');
      option.value = deck.id;
      option.textContent = deck.name;
      deckSelector.appendChild(option);
    });
  }
}

document.getElementById('load-deck-button').addEventListener('click', async () => {
  const deckId = document.getElementById('deck-selector').value;
  if (deckId) {
    await loadDeck(deckId);
    toggleDeckControls(true);
  }
});

document.getElementById('new-deck-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const deckName = document.getElementById('new-deck-name').value.trim();
  if (deckName) {
    const response = await fetch('/api/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: deckName, cardList: [] }),
    });
    if (response.ok) {
      const newDeck = await response.json();
      await loadDeck(newDeck.id);
      toggleDeckControls(true);
    } else {
      Swal.fire('Error', 'Failed to create deck', 'error');
    }
  }
});

document.getElementById('delete-deck-button').addEventListener('click', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const deckId = urlParams.get('deckId');
  if (deckId) {
    const deckName = document.getElementById('deck-name-display').textContent;
    Swal.fire({
      title: 'Confirm Deletion',
      text: `Type the deck name (${deckName}) to confirm deletion:`,
      input: 'text',
      inputValidator: (value) => {
        if (value !== deckName) {
          return 'Deck name does not match';
        }
      },
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch('/api/decks/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: deckId }),
        });
        if (response.ok) {
          document.location.reload();
        } else {
          Swal.fire('Error', 'Failed to delete deck', 'error');
        }
      }
    });
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

      // Check if the card is already in the deck
      const existingCard = document.querySelector(`.cardDeck img[alt="${cardData.name}"]`);
      if (existingCard) {
        Toast.fire({
          icon: 'error',
          title: 'Card is already in the deck',
        });
        return;
      }

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
        <div class="card-content">
          <img src="${cardData.image_uris.normal}" alt="${cardData.name}">
          <div>Price: $${cardData.prices.usd}</div>
          <button class="remove-card">Remove</button>
        </div>
      `;
      stack.appendChild(cardElement);

      cardElement.querySelector('.remove-card').addEventListener('click', () => {
        cardElement.remove();
        // Check if the stack is empty and remove it if necessary
        if (stack.querySelectorAll('.cardDeck').length === 0) {
          stack.remove();
        }
      });
    } else {
      Swal.fire('Error', 'Invalid card name', 'error');
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
    Toast.fire({
      icon: 'success',
      title: 'Deck saved successfully',
    });
  } else {
    Toast.fire({
      icon: 'error',
      title: 'Failed to save deck',
    });
  }
});

document.getElementById('export-deck-button').addEventListener('click', () => {
  const deckView = document.getElementById('deck-view');
  let exportText = '';
  document.querySelectorAll('.cardDeck').forEach(card => {
    const cardName = card.querySelector('img').alt;
    exportText += `1 ${cardName}\n`;
  });
  const blob = new Blob([exportText], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${document.getElementById('deck-name-display').textContent}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
});

document.getElementById('import-deck-button').addEventListener('click', () => {
  const textarea = document.getElementById('import-deck-textarea');
  textarea.style.display = textarea.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('import-deck-textarea').addEventListener('blur', async function() {
  const textarea = document.getElementById('import-deck-textarea');
  const lines = textarea.value.trim().split('\n');
  const cardNames = lines.map(line => line.replace(/^\d+\s*/, '').trim());
  const invalidCards = [];

  for (const cardName of cardNames) {
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
    if (!response.ok) {
      invalidCards.push(cardName);
    }
  }

  if (invalidCards.length > 0) {
    Swal.fire('Error', `Invalid card names: ${invalidCards.join(', ')}`, 'error');
  } else {
    const deckView = document.getElementById('deck-view');
    deckView.innerHTML = ''; // Clear current deck view

    for (const cardName of cardNames) {
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
          <div class="card-content">
            <img src="${cardData.image_uris.normal}" alt="${cardData.name}">
            <div>Price: $${cardData.prices.usd}</div>
            <button class="remove-card">Remove</button>
          </div>
        `;
        stack.appendChild(cardElement);

        cardElement.querySelector('.remove-card').addEventListener('click', () => {
          cardElement.remove();
          // Check if the stack is empty and remove it if necessary
          if (stack.querySelectorAll('.cardDeck').length === 0) {
            stack.remove();
          }
        });
      }
    }
  }

  textarea.style.display = 'none';
});

async function loadDeck(deckId) {
  // Update the URL to include the deckId
  const url = new URL(window.location);
  url.searchParams.set('deckId', deckId);
  window.history.pushState({}, '', url);

  const response = await fetch(`/api/decks/${deckId}`);
  if (response.ok) {
    const deckData = await response.json();
    
    // Set deck name at the top
    document.getElementById('deck-name-display').textContent = deckData.name;

    const deckView = document.getElementById('deck-view');
    deckView.innerHTML = ''; // Clear current deck view
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
          <div class="card-content">
            <img src="${cardData.image_uris.normal}" alt="${cardData.name}">
            <div>Price: $${cardData.prices.usd}</div>
            <button class="remove-card">Remove</button>
          </div>
        `;
        stack.appendChild(cardElement);

        cardElement.querySelector('.remove-card').addEventListener('click', () => {
          cardElement.remove();
          // Check if the stack is empty and remove it if necessary
          if (stack.querySelectorAll('.cardDeck').length === 0) {
            stack.remove();
          }
        });
      }
    });
    toggleDeckControls(true);
  }
}

function toggleDeckControls(show) {
  const topControls = document.getElementById('top-controls');
  const cardSearchContainer = document.getElementById('card-search-container');
  const deckListContainer = document.getElementById('deck-list-container');
  const deckControls = document.getElementById('deck-controls');
  const importExportControls = document.getElementById('import-export-controls');
  if (show) {
    topControls.style.display = 'block';
    cardSearchContainer.style.display = 'block';
    deckListContainer.style.display = 'block';
    importExportControls.style.display = 'block';
    deckControls.style.display = 'none'; // Hide loading/creating options
  } else {
    topControls.style.display = 'none';
    cardSearchContainer.style.display = 'none';
    deckListContainer.style.display = 'none';
    importExportControls.style.display = 'none';
    deckControls.style.display = 'block'; // Show loading/creating options
  }
}