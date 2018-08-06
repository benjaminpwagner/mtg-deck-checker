First run <code>npm install</code>

Then, put your decklist in <code>decklist.txt</code>

Finally, try <code>node check.js</code>

Usage:

<code>
  const Deck = require('./Deck.js');
  
  // decklist should be string copied from cockatrice deck editor
  var yourDeck = new Deck(decklist, format);
  
  // Deck constructor will automatically run yourDeck.check()
  console.log(yourDeck.isLegal, yourDeck.errors);
  
  // if you want to keep the same obj but update the deck or format
  yourDeck.check(decklist, format);
  
  // you can add cards to your deck, then check if it is still legal
  yourDeck.addCard(card, 1);
  yourDeck.check();
</code>

TODO:
- add checks for commander to make sure all cards are within commanders color identity 
- add checks for historic standard
