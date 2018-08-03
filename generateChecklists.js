const fs = require('fs');

var ScryfallClient = require('scryfall-client');
var scryfall = new ScryfallClient();

const allCards = JSON.parse(fs.readFileSync(`./whitelists/AllCards.json`));
var cardData = {};

var checklists = {
  standard: {
    whitelist: [],
  },
  frontier: {
    whitelist: [],
  },
  modern: {
    whitelist: [],
    banlist: []
  },
  pauper: {
    whitelist: [],
    banlist: []
  },
  legacy: {
    banlist: []
  },
  vintage: {
    banlist: [],
    restricted: []
  },
  commander: {
    whitelist: [],
    banlist: []
  },
};

var skipped = [];

var parseCard = async function(cardName) {
  try {
    await scryfall.get('cards/search', {
      q: cardName
    }).then(function (cards) {
      cards.forEach(function (card) {
        if (card.name === cardName) {
          // stores scryfall card obj in our own json for later use
          cardData[cardName] = card;

          // STANDARD CHECKLISTS
          if (card.legalities.standard === 'legal') {
            checklists.standard.whitelist.push(cardName);
          }

          // FRONTIER CHECKLISTS
          if (card.legalities.frontier === 'legal') {
            checklists.frontier.whitelist.push(cardName);
          }

          // MODERN CHECKLISTS
          if (card.legalities.modern === 'legal') {
            checklists.modern.whitelist.push(cardName);
          }

          if (card.legalities.modern === 'not_legal') {
            checklists.modern.banlist.push(cardName);
          }

          // PAUPER CHECKLISTS
          if (card.legalities.pauper === 'legal') {
            checklists.pauper.whitelist.push(cardName);
          }

          if (card.legalities.pauper === 'not_legal') {
            checklists.pauper.banlist.push(cardName);
          }

          // LEGACY CHECKLISTS
          if (card.legalities.legacy === 'not_legal') {
            checklists.legacy.banlist.push(cardName);
          }

          // VINTAGE CHECKLISTS
          if (card.legalities.vintage === 'not_legal') {
            checklists.vintage.banlist.push(cardName);
          }

          if (card.legalities.vintage === 'restricted') {
            checklists.vintage.restricted.push(cardName);
          }

          // COMMANDER CHECKLISTS
          if (card.legalities.commander === 'legal') {
            checklists.commander.whitelist.push(cardName);
          }

          if (card.legalities.commander === 'not_legal') {
            checklists.commander.banlist.push(cardName);
          }

        }
      })
    })
  } catch(error) {
    skipped.push(cardName);
  }
}

var get = async function() {
  var count = 0;
  for (card in allCards) {
    if (allCards.hasOwnProperty(card)) {
      console.log(++count, card);
      await parseCard(card);

      // for testing purposes...
      // if (count === 10) break
    }
  }

  // writes all lists to individual files
  for (format in checklists) {
    if (checklists.hasOwnProperty(format)) {
      for (list in checklists[format]) {
        if (checklists[format].hasOwnProperty(list)) {
          fs.writeFileSync(`./checklists/${format}/${list}.json`,
              JSON.stringify( checklists[format][list], undefined, 2  )  );
        }
      }
    }
  }

  fs.writeFileSync('cardData.json', JSON.stringify(cardData, undefined, 2));

  fs.writeFileSync('./checklists/skipped.json',
      JSON.stringify( skipped, undefined, 2 ));

}

var genCardDataLight = () => {
  var cardDataLight = {};
  const cardData = JSON.parse( fs.readFileSync('cardData.json') );
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
  fs.writeFileSync('cardDataLight.json', JSON.stringify(cardDataLight, undefined, 2));
}

genFromCardData();
