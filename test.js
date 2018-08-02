console.time("test");
const Deck = require('./Deck.js');
const fs = require('fs');

fs.readFile('decklist.txt', 'utf8', function(err, decklist) {
  if (err) throw err;
  const format = 'legacy'
  var deck = new Deck.Deck(decklist, format)
  console.log(deck.isLegal ?
    `Decklist is legal for ${format}!`
    :`Illegal decklist for ${format}!`
  );
});

console.timeEnd("test");
