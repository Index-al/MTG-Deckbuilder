let questionsAsked = 1;
const maxQuestions = 20;

// Start the game by getting a random commander
function startGame() {
  fetch('/game/start-game')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log(data.message);
      }
    })
    .catch(err => console.error('Error starting the game:', err));
}

// Submit a yes/no question about the commander
function submitQuestion() {
  const questionInput = document.getElementById('questionInput');
  const question = questionInput.value;

  // Console log debugging
  console.log(`\n\nQuestion received: ${question}`);

  console.log("Questions asked: " + questionsAsked);
  
  if (questionsAsked >= maxQuestions) {
    alert('You have reached the maximum number of questions. Refresh to try again!');
    return;
  }
  
  fetch('/game/ask-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Answer: ${data.answer ? 'Yes' : 'No'}`);
      console.log("Response: " + data.answer);
      questionsAsked++;
    } else {
      alert(data.message);
    }
    questionInput.value = ''; // Clear the input field
  })
  .catch(err => console.error('Error asking question:', err));
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', startGame);
