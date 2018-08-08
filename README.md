Usage:

<code>npm i --save mtg-deck-checker</code>

<code>const Deck = require('mtg-deck-checker');</code>
  
<code>var decklist</code> assumes cockatrice deck editor format, but many other formats are supported incidentally.

<code>var yourDeck = new Deck.Deck(decklist, format);</code>
  
Deck constructor will automatically run <code>yourDeck.check()</code>

<code>console.log(yourDeck.isLegal, yourDeck.errors);</code>

You can see you deck hash with <code>yourDeck.hash</code>
  
if you want to keep the same obj but update the deck or format

<code>yourDeck.check(decklist, format);</code>
  
You can add cards to your deck, then check if it is still legal

<code>yourDeck.addCard(card, 1);</code>

<code>yourDeck.check();</code>

Access mainboard/sideboard directly with <code>yourDeck.main, yourDeck.side</code>


TODO:
- add checks for commander to make sure all cards are within commanders color identity 
- add permamnent script to pull from mtgjson to update our cardData.json
