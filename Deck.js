const fs = require('fs');

function Deck(decklist, format) {
  this.list = decklist;
  this.format = format;

  // default values
  // these values are reset by Deck.check()
  this.cards = {};
  this.size = 0;
  this.errors = [];
  this.isLegal = false;

  // check the deck and print errors
  this.check();
  if (this.errors.length > 0) {
    for(var i=0; i<this.errors.length; i++) console.log(this.errors[i])
  }
}

Deck.prototype.addCard = function(card, amount) {
  if (this.cards.hasOwnProperty(card)) {
    this.cards[card].amount += amount;
  } else {
    this.cards[card] = {
      amount: amount
    }
  }
}

Deck.prototype.parseList = function() {
  this.cards = {};
  this.list
    .split('\n')
    .forEach(line => {
      if(line !== '' && line.indexOf('//') === -1) {
        const regexData = line.match(/[0-9]+/);
        name = line.slice(regexData[0].length+regexData.index+1);
        this.addCard(name, parseInt(regexData[0]));
      }
    });
}

Deck.prototype.check = function() {
  this.parseList();
  this.size = 0;
  this.errors = [];
  this.isLegal = false;

  const cardData = JSON.parse(fs.readFileSync(`./json/cardDataLight.json`));
  for (card in this.cards) {
    if (this.cards.hasOwnProperty(card)) {

      const CYCHMTFO = [ //cardsYouCanHaveMoreThanFourOf
        'island',
        'plains',
        'swamp',
        'forest',
        'mountain',
        'wastes',
        'ratcolony',
        'relentlessrats',
        'shadowbornapostle'
      ]

      // check if card is legal in format
      if (cardData[card].legalities[this.format] !== 'legal') {

        // not legal? maybe is restricted...
        if (cardData[card].legalities[this.format] === 'restricted') {

          // its restricted, but are we playing just one copy? 
          if (this.cards[card].amount > 1) {
            this.errors.push( `${card} is restricted.` );
          }
        }

        // okay, its not legal nor restricted
        else {
          this.errors.push( `${card} is not legal in ${this.format}.` );
        }
      }

      // card is legal, make sure there is valid amounts
      else {
        if (this.cards[card].amount > 4 && CYCHMTFO.indexOf(card) === -1) {
          this.errors.push( `Deck has more than 4 ${card}.` );
        }
      }

      this.size += this.cards[card].amount
    }
  }

  // decksize checks
  if (this.format === 'commander') {
    if (this.size < 99) this.errors.push( `Deck has less than 100 cards.` );
  } else {
    if (this.size < 60) this.errors.push( `Deck has less than 60 cards.` );
  }

  // if no errors were found, the fuck must be legal
  if (this.errors.length === 0) this.isLegal = true;


  // potentially obsolete code below
  // whitelisting may be optimal for server

  // const whitelist = JSON.parse(fs.readFileSync(`./whitelists/${this.format}.json`));
  // for (card in this.cards) {
  //   if (this.cards.hasOwnProperty(card)) {
  //     if (format === 'vintage') {
  //       if (whitelist['whitelist'].indexOf(this.cards[card].name) === -1) {
  //         if (whitelist['restricted'].indexOf(this.cards[card].name) === -1) {
  //           return false;
  //         } else {
  //           if (this.cards[card].amount > 1) {
  //             return false;
  //           }
  //         }
  //       }
  //     } else {
  //       if (whitelist.indexOf(this.cards[card].name) === -1) {
  //         return false;
  //       }
  //     }
  //   }
  // }
}

module.exports = {
  Deck
}
