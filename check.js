const Deck = require('./Deck.js');
const fs = require('fs');
console.time("check");

let checkLegality = (deck) => {
  if (deck.format !== 'historic') {
    console.log(deck.isLegal ?
      `Decklist is legal for ${deck.format}!`
      :`Illegal decklist for ${deck.format}!`
    );
  } else {
    if (deck.isLegal) {
      for (let i=0; i<deck.legalStandards.length; i++) {
        console.log(`Deck is legal for ${deck.legalStandards[i]} standard.`)
      }
    }
  }
  console.log(`Deck hash: ${deck.hash}`);
}

fs.readFile('decklist.txt', 'utf8', function(err, decklist) {
  if (err) throw err;

  let format = 'historic';
  let deck = new Deck.Deck(decklist, format)
  checkLegality(deck);

  // format = 'commander';
  // deck.check(undefined, format);
  // checkLegality(deck);
});

console.timeEnd("check");
