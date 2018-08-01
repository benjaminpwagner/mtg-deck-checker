console.time("test");
const Deck = require('./Deck.js');
const fs = require('fs');

fs.readFile('decklist.txt', 'utf8', function(err, decklist) {
  if (err) throw err;
  deck = new Deck.Deck(decklist, 'standard');
  console.log(deck.isLegal ?
    `Decklist is legal for ${deck.format}!`
    :`Illegal decklist for ${deck.format}!`
  );
});

console.timeEnd("test");
