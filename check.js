console.time("check");
const Deck = require('./Deck.js');
const fs = require('fs');

var checkLegality = (deck) => {
  console.log(deck.isLegal ?
    `Decklist is legal for ${deck.format}!`
    :`Illegal decklist for ${deck.format}!`
  );
}

fs.readFile('decklist.txt', 'utf8', function(err, decklist) {
  if (err) throw err;

  var format = 'vintage';
  var deck = new Deck.Deck(decklist, format)
  checkLegality(deck);

  format = 'commander';
  deck.check(undefined, format);
  checkLegality(deck);
});

console.timeEnd("check");
