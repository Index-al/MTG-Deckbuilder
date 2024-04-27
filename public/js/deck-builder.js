document.getElementById('deck-search-button').addEventListener('click', function() {
    const cardName = document.getElementById('deck-search-input').value.trim();
    if (cardName) {
      // Add the card to the deck list
      const deckList = document.getElementById('deck-card-list');
      const listItem = document.createElement('li');
      listItem.textContent = cardName;
      deckList.appendChild(listItem);
  
      // Clear the input field
      document.getElementById('deck-search-input').value = '';
    }
  });