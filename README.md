First run <code>npm install</code>

Then, put your decklist in <code>decklist.txt</code>

Finally, try <code>node check.js</code>

Usage:

<code>const Deck = require('./Deck.js');</code>
  
var decklist should be string copied from cockatrice deck editor

<code>var yourDeck = new Deck(decklist, format);</code>
  
Deck constructor will automatically run <code>yourDeck.check()</code>

<code>console.log(yourDeck.isLegal, yourDeck.errors);</code>
  
if you want to keep the same obj but update the deck or format

<code>yourDeck.check(decklist, format);</code>
  
You can add cards to your deck, then check if it is still legal

<code>yourDeck.addCard(card, 1);</code>

<code>yourDeck.check();</code>


TODO:
- add checks for commander to make sure all cards are within commanders color identity 
- add permamnent script to pull from mtgjson to update our cardData.json
- add support for Deck.mainboard / Deck.sideboard
- deck hash
