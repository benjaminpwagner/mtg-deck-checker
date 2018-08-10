const fs = require('fs');
const mtgjsonP = require('mtgjson-promise');

const update = async function() {

  let historic = JSON.parse(fs.readFileSync(`./json/historic.json`));
  const {data, etag} = await mtgjsonP({extra: true});
  let currCard;
  let cardData = {};

  let cardsToIgnore = [
    'Island',
    'Plains',
    'Swamp',
    'Forest',
    'Mountain',
    'Wastes'
  ];
  
  for(set in data) {
    if (data.hasOwnProperty(set)) {

      for (card in data[set].cards) {
        if(data[set].cards.hasOwnProperty(card)) {
          currCard = data[set].cards[card];

          if (currCard.legalities && cardsToIgnore.indexOf(currCard.name) === -1) {
            if (!cardData.hasOwnProperty(currCard.name)) {
              let legalities = {};

              for (var i=0; i<currCard.legalities.length; i++) {
                legalities[currCard.legalities[i].format.toLowerCase()] = currCard.legalities[i].legality.toLowerCase();
              }

              cardData[currCard.name] = {
                legalities,
                name: currCard.name,
                sets: currCard.printings,
                colorIdentity: currCard.colorIdentity
              }
            }
          }
        }
      }
    }
  }

  for (card in cardData) {
    if (cardData.hasOwnProperty(card) && cardsToIgnore.indexOf(card) === -1) {
      cardData[card]['standards'] = [];

      for (standard in historic) {
        if (historic.hasOwnProperty(standard)) {
          if (standard !== 'banlist' && standard !== 'sets') {

            for (var i=0; i<cardData[card].sets.length; i++) {
              
              if (historic[standard].indexOf(cardData[card].sets[i]) !== -1) {
                cardData[card]['standards'].push(standard)
              }

            }
          }
        }
      }
    }
  }

  fs.writeFileSync('./json/cardData.json', JSON.stringify(cardData, undefined, 2));
}

module.exports = {
  update
}