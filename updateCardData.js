const fs = require('fs');
const mtgjsonP = require('mtgjson-promise');

const update = async function() {

  const {data, etag} = await mtgjsonP();

  if (etag) {
    console.log(etag)
  } else {

    for(set in data) {
      if (data.hasOwnProperty(set)) {

        let logName;

        for (card in data[set].cards) {
          if(data[set].cards.hasOwnProperty(card)) {

            console.log(set.cards[card].legalities)
          }

        }
        if (logName) console.log(set)
      }
    }

  }

}

update();

// ===========================
// add historic standard blocks to card legality
//
// var cardData = JSON.parse(fs.readFileSync(`./json/cardData.json`));
// var historic = JSON.parse(fs.readFileSync(`./json/historic.json`));
//
// for (card in cardData) {
//   if (cardData.hasOwnProperty(card)) {
//     cardData[card]['standards'] = [];
//     for (standard in historic) {
//       if (historic.hasOwnProperty(standard)) {
//         if (standard !== 'banlist' && standard !== 'sets' && cardData[card].legalities !== undefined) {
//           for (var i=0; i<cardData[card].sets.length; i++) {
//             if (historic[standard].indexOf(cardData[card].sets[i]) !== -1) {
//               cardData[card]['standards'].push(standard)
//             }
//           }
//         }
//       }
//     }
//   }
// }
// fs.writeFileSync('./json/cardData.json', JSON.stringify(cardData, undefined, 2));


// ===========================
// reformats cardData for faster indexing

// var cardData = JSON.parse(fs.readFileSync(`./json/cardData.json`));
// var legalities;
// var newCardData = {};
//
// for (card in cardData) {
//   if (cardData.hasOwnProperty(card)) {
//     // console.log(card)
//     // console.log(cardData[card].legalities[0]);
//     if (cardData[card].legalities !== undefined) {
//       legalities = {};
//       for (var i=0; i<cardData[card].legalities.length; i++) {
//         legalities[cardData[card].legalities[i].format.toLowerCase()] = cardData[card].legalities[i].legality.toLowerCase();
//       }
//       cardData[card].legalities = legalities;
//     }
//   }
// }
// fs.writeFileSync('./json/cardData.json', JSON.stringify(cardData, undefined, 2));


// ===========================
// used mtgjson to grab json data for every set
// then went through every set and collect trimmed down card data
//   while ignoring cards from extraneous sets to trim file size

// var cardData = {};
// var set;
// var card;

// fs.readdir('./mtgjson/sets', (err, files) => {
//   files.forEach(file => {
//     if (file.replace(/[a-zA-Z0-9]+/, '') === '.json' && file.charAt(0) !== 'p' && file.charAt(0) !== 'V') {
//       set = JSON.parse(fs.readFileSync(`./temp_json/json/${file}`));
//       for (var i=0; i<set.cards.length; i++) {
//         card = set.cards[i];
//         if (cardData.hasOwnProperty(card.name) === false) {
//           cardData[card.name] = {
//             name: card.name,
//             legalities: card.legalities,
//             colorIdentity: card.colorIdentity,
//             sets: card.printings
//           }
//         }
//       }
//       fs.writeFileSync('./json/cardData.json', JSON.stringify(cardData, undefined, 2));
//     }
//   });
// });



// ===========================
// potentially outdated code

// var ScryfallClient = require('scryfall-client');
// var scryfall = new ScryfallClient();

//const allCards = [...array of all magic cards]
// var cardData = {};
// var skipped = [];

// var parseCard = async function(cardName) {
//   try {
//     await scryfall.get('cards/search', {
//       q: cardName
//     }).then(function (cards) {
//       cards.forEach(function (card) {
//         if (card.name === cardName) {
//           cardData[cardName] = card;
//
//         }
//       })
//     })
//   } catch(error) {
//     skipped.push(cardName);
//   }
// }
//
// var getCardData = async function() {
//   var count = 0;
//   for (card in allCards) {
//     if (allCards.hasOwnProperty(card)) {
//       console.log(++count, card);
//       await parseCard(card);
//       // for testing purposes...
//       // if (count === 10) break
//     }
//   }
//
//   fs.writeFileSync('./json/cardData.json', JSON.stringify(cardData, undefined, 2));
//
//   fs.writeFileSync('./json/skipped.json',
//       JSON.stringify( skipped, undefined, 2 ));
//
// }
//
// var getCardDataLight = () => {
//   var cardDataLight = {};
//   const cardData = JSON.parse( fs.readFileSync('./json/cardData.json') );
//   for (card in cardData) {
//     if (cardData.hasOwnProperty(card)) {
//       cardDataLight[card] = {
//         name: cardData[card].name,
//         colors: cardData[card].colors,
//         legalities: cardData[card].legalities,
//         set: cardData[card].set
//       }
//     }
//   }
//   fs.writeFileSync('./json/cardDataLight.json', JSON.stringify(cardDataLight, undefined, 2));
// }

// getCardData();
// getCardDataLight();
