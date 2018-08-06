const Deck = require('./Deck.js');
const fs = require('fs');
console.time("check");

var checkLegality = (deck) => {
  if (deck.format !== 'historic') {
    console.log(deck.isLegal ?
      `Decklist is legal for ${deck.format}!`
      :`Illegal decklist for ${deck.format}!`
    );
  } else {
    if (deck.isLegal) {
      for (var i=0; i<deck.legalStandards.length; i++) {
        console.log(`Deck is legal for ${deck.legalStandards[i]} standard.`)
      }
    }
  }
}

fs.readFile('decklist.txt', 'utf8', function(err, decklist) {
  if (err) throw err;

  var format = 'historic';
  var deck = new Deck.Deck(decklist, format)
  checkLegality(deck);

  // format = 'commander';
  // deck.check(undefined, format);
  // checkLegality(deck);
});

console.timeEnd("check");
