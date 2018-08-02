const fs = require('fs');
var ScryfallClient = require('scryfall-client');
var scryfall = new ScryfallClient();

var checklists = {
  standard: [],
  modern: [],
  frontier: [],
  pauper: [],
  legacy: [],
  vintage: {
    banned: [],
    restricted: []
  }
};
var cardName = "Ancestral Recall"

var parseCard = async function(cardName) {
  scryfall.get('cards/search', {
    q: cardName
  }).then(function (cards) {
    cards.forEach(function (card) {
      if (card.name === cardName) {

        if (card.legalities.standard === 'legal') {
          checklists.standard.push(cardName);
        }

        if (card.legalities.modern === 'legal') {
          checklists.modern.push(cardName);
        }

        if (card.legalities.frontier === 'legal') {
          checklists.frontier.push(cardName);
        }

        if (card.legalities.pauper === 'legal') {
          checklists.pauper.push(cardName);
        }

        if (card.legalities.legacy === 'not_legal') {
          checklists.legacy.push(cardName);
        }

        if (card.legalities.vintage === 'not_legal') {
          checklists.vintage.banned.push(cardName);
        }
        console.log(card.legalities.vintage)
        if (card.legalities.vintage === 'restricted') {
          checklists.vintage.restricted.push(cardName);
        }

      }
    })
  console.log(checklists)
  })
}

parseCard("Swamp");
