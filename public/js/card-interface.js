function addCard() {
    const cardContainer = document.getElementById("cardContainer");
    const cardTemplate = Handlebars.compile(document.getElementById("card-template").innerHTML);
    const cardHtml = cardTemplate();
    cardContainer.insertAdjacentHTML("beforeend", cardHtml);
  }
  
  document.getElementById("deckForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const deckName = document.getElementById("deckName").value;
    const cards = document.querySelectorAll("textarea[name='cardContent']");
    
    const deckData = {
      name: deckName,
      cards: []
    };
  
    cards.forEach(function(card) {
      deckData.cards.push(card.value);
    });
  
    console.log(deckData); // Just for demonstration, you would typically send this data to a server for processing or save it locally
  });
  