// This function should toggle the visibility of the clipboard contents
function toggleClipboard() {
    const clipboardBar = document.getElementById('clipboard-bar');
    const arrow = document.getElementById('clipboard-arrow');
    const trash = document.getElementById('clear-clipboard');
    const copy = document.getElementById('copy-clipboard');
    const buy = document.getElementById('buy-clipboard');
    const info = document.getElementById('clipboard-info');
    const infoExtended = document.getElementById('info-extended');
    clipboardBar.classList.toggle('clipboard-expanded');

    // Toggle arrow direction
    if (clipboardBar.classList.contains('clipboard-expanded')) {
        arrow.textContent = '↓'; // Show down arrow when expanded
        trash.textContent = '🗑️' // Show trash when expanded
        copy.textContent = '📋' // Show copy when expanded
        buy.textContent = '🛒' // Show buy when expanded
        info.textContent = 'Clear - Buy - Copy' // Show info when expanded
        infoExtended.textContent = `If you'd like to purchase all the cards in your clipboard, first hit the "Copy" button, then paste your cards into the mass card entry after clicking the "Shop" button.` // Show info when expanded
    } else {
        arrow.textContent = '↑'; // Up arrow when collapsed
        trash.textContent = '' // Hide trash when collapsed
        copy.textContent = '' // Hide copy when collapsed
        buy.textContent = '' // Hide buy when collapsed
        info.textContent = '' // Hide info when collapsed
        infoExtended.textContent = '' // Hide info when collapsed
    }
}

// Function to add a card to the clipboard
function addToClipboard(cardName) {
    let clipboard = JSON.parse(localStorage.getItem('cardClipboard')) || [];
    if (!clipboard.includes(cardName)) {
    clipboard.push(cardName);
    localStorage.setItem('cardClipboard', JSON.stringify(clipboard));
    updateClipboardUI();
    updateAddToClipboardButtons();
    }
}

// Function to update the clipboard UI with stored items
function updateClipboardUI() {
    const clipboard = JSON.parse(localStorage.getItem('cardClipboard')) || [];
    const container = document.querySelector('.clipboard-content');
    container.innerHTML = ''; // Clear current content
    clipboard.forEach(cardName => {
    const element = document.createElement('div');
    element.textContent = cardName;

    // Remove card from clipboard button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default button action
        event.stopPropagation(); // Stop event bubbling
        const cardName = this.parentElement.dataset.cardName;
        removeFromClipboard(cardName);
    });
    element.appendChild(removeButton);
    element.classList.add('clipboard-item');
    element.dataset.cardName = cardName;
    element.addEventListener('contextmenu', function(event) {
        event.preventDefault(); // Prevent default button action
        event.stopPropagation(); // Stop event bubbling
        const cardName = this.dataset.cardName;
        removeFromClipboard(cardName);
    });

    container.appendChild(element);
    });
}

// Function to remove a card from the clipboard
function removeFromClipboard(cardName) {
    let clipboard = JSON.parse(localStorage.getItem('cardClipboard')) || [];
    clipboard = clipboard.filter(name => name !== cardName);
    localStorage.setItem('cardClipboard', JSON.stringify(clipboard));
    updateClipboardUI();
    updateAddToClipboardButtons();
}

// Function to clear the clipboard
function clearAllClipboard(event) {
    event.stopPropagation(); // Prevent the clipboard from toggling when the trash can is clicked
    localStorage.setItem('cardClipboard', JSON.stringify([])); // Clear the clipboard
    updateClipboardUI(); // Refresh the UI
    updateAddToClipboardButtons(); // Update the add to clipboard buttons
}

function openTCGPlayerMassEntry() {
    window.open('https://www.tcgplayer.com/massentry', '_blank');
}

// Function to copy the clipboard content to the user's computer clipboard
function copyClipboardContent() {
    const clipboard = JSON.parse(localStorage.getItem('cardClipboard')) || [];
    const formattedText = clipboard.map(cardName => `1 ${cardName}`).join('\n');
    const copyButton = document.getElementById('copy-clipboard'); // Get the copy button
    
    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(formattedText).then(() => {
    console.log('Clipboard content copied!');

    // Change button text for visual feedback
    copyButton.textContent = 'Copied!'; // Change button text

    // Set a timeout to revert the button back to its original state
    setTimeout(() => {
        copyButton.textContent = '📋'; // Revert button text
    }, 2000); // 2000 milliseconds = 2 seconds
    }).catch(err => {
    console.error('Failed to copy: ', err);
    });
}  

// Function to add or update add-to-clipboard buttons for each card
function updateAddToClipboardButtons() {
    const clipboard = JSON.parse(localStorage.getItem('cardClipboard')) || [];
    document.querySelectorAll('.add-to-clipboard').forEach(button => {
      const cardName = button.getAttribute('data-card-name');
      if (clipboard.includes(cardName)) {
        // Card is in the clipboard, change symbol and make button always visible
        button.textContent = '✔️';
        button.style.opacity = '0.7';
        button.style.backgroundColor = '#191919';
      } else {
        // Card is not in the clipboard, use '📋' symbol
        button.textContent = '📋';
        button.style.opacity = ''; // Reset opacity
      }
    });

    document.querySelectorAll('.add-to-clipboard-search').forEach(button => {
        const cardName = button.getAttribute('data-card-name');
        if (clipboard.includes(cardName)) {
          // Card is in the clipboard, change symbol and make button always visible
          button.textContent = '✔️';
          button.style.opacity = '0.7';
          button.style.backgroundColor = '#191919';
        } else {
          // Card is not in the clipboard, use '📋' symbol
          button.textContent = '📋';
          button.style.opacity = ''; // Reset opacity
        }
      });
  }

// Attach event listeners to add-to-clipboard buttons
document.querySelectorAll('.add-to-clipboard').forEach(button => {
    button.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default button action
    event.stopPropagation(); // Stop event bubbling
    const cardName = this.dataset.cardName;
    addToClipboard(cardName);
    });
});

// Attach event listeners to add-to-clipboard buttons
document.querySelectorAll('.add-to-clipboard-search').forEach(button => {
    button.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default button action
    event.stopPropagation(); // Stop event bubbling
    const cardName = this.dataset.cardName;
    addToClipboard(cardName);
    });
});

// Initial call to display cards in the clipboard on page load
document.addEventListener('DOMContentLoaded', function() {
    const clipboardBar = document.getElementById('clipboard-bar');
    const clearButton = document.getElementById('clear-clipboard');
    const copyButton = document.getElementById('copy-clipboard');
    const buyButton = document.getElementById('buy-clipboard');

    if (clipboardBar) {
      clipboardBar.addEventListener('click', toggleClipboard);
    }

    if (buyButton) {
        buyButton.addEventListener('click', openTCGPlayerMassEntry);
    }

    updateAddToClipboardButtons();
    updateClipboardUI();

    clearButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the clipboard from toggling
        localStorage.setItem('cardClipboard', JSON.stringify([]));
        updateClipboardUI();
      });

      copyButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the clipboard from toggling
        copyClipboardContent();
      });
  });