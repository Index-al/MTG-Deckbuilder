document.addEventListener('DOMContentLoaded', async () => {
    await loadDecks();
  
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
          await loadDecks();
          Toast.fire({
            icon: 'success',
            title: 'Deck created successfully',
          });
        } else {
          Toast.fire({
            icon: 'error',
            title: 'Failed to create deck',
          });
        }
      }
    });
  });
  
  async function loadDecks() {
    const response = await fetch('/api/decks');
    if (response.ok) {
      const decks = await response.json();
      const deckList = document.getElementById('deck-list');
      deckList.innerHTML = ''; // Clear current deck list
      decks.forEach(deck => {
        const deckElement = document.createElement('div');
        deckElement.classList.add('deck');
        deckElement.innerHTML = `
          <h3>${deck.name}</h3>
          <button class="delete-deck-button" data-id="${deck.id}">Delete Deck</button>
          <a href="/deck-builder?deckId=${deck.id}">Edit Deck</a>
        `;
        deckList.appendChild(deckElement);
  
        deckElement.querySelector('.delete-deck-button').addEventListener('click', async function() {
          const deckId = this.getAttribute('data-id');
          const deckName = deckElement.querySelector('h3').textContent;
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
                await loadDecks();
                Toast.fire({
                  icon: 'success',
                  title: 'Deck deleted successfully',
                });
              } else {
                Toast.fire({
                  icon: 'error',
                  title: 'Failed to delete deck',
                });
              }
            }
          });
        });
      });
    }
  }
