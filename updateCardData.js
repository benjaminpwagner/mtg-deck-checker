const fs = require('fs');

var ScryfallClient = require('scryfall-client');
var scryfall = new ScryfallClient();

//const allCards = [...array of all magic cards]
var cardData = {};
var skipped = [];

var parseCard = async function(cardName) {
  try {
    await scryfall.get('cards/search', {
      q: cardName
    }).then(function (cards) {
      cards.forEach(function (card) {
        if (card.name === cardName) {
          cardData[cardName] = card;

        }
      })
    })
  } catch(error) {
    skipped.push(cardName);
  }
}

var getCardData = async function() {
  var count = 0;
  for (card in allCards) {
    if (allCards.hasOwnProperty(card)) {
      console.log(++count, card);
      await parseCard(card);
      // for testing purposes...
      // if (count === 10) break
    }
  }

  fs.writeFileSync('./json/cardData.json', JSON.stringify(cardData, undefined, 2));

  fs.writeFileSync('./json/skipped.json',
      JSON.stringify( skipped, undefined, 2 ));

}

var getCardDataLight = () => {
  var cardDataLight = {};
  const cardData = JSON.parse( fs.readFileSync('./json/cardData.json') );
  for (card in cardData) {
    if (cardData.hasOwnProperty(card)) {
      cardDataLight[card] = {
        name: cardData[card].name,
        colors: cardData[card].colors,
        legalities: cardData[card].legalities,
        set: cardData[card].set
      }
    }
  }
  fs.writeFileSync('./json/cardDataLight.json', JSON.stringify(cardDataLight, undefined, 2));
}

// getCardData();
// getCardDataLight();
