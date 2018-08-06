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

Deck.prototype.check = function(decklist=undefined,format=undefined) {
  if (decklist) this.decklist = decklist;
  if (format) this.format = format;
  this.parseList();
  this.size = 0;
  this.errors = [];
  this.isLegal = false;

  const CYCHMTFO = [ //cardsYouCanHaveMoreThanFourOf
    'Island',
    'Plains',
    'Swamp',
    'Forest',
    'Mountain',
    'Wastes',
    'Rat Colony',
    'Relentless Rats',
    'Shadowborn Apostle'
  ];

  const cardData = JSON.parse(fs.readFileSync(`./json/cardData.json`));

  if (this.format === 'historic') {
    var standardsInDeck = [];
    var standard;
    var currStandard;
    var cardsToIgnore = [
      'Island',
      'Plains',
      'Swamp',
      'Forest',
      'Mountain',
      'Wastes'
    ];

    for (card in this.cards) {
      if (this.cards.hasOwnProperty(card)) {

        // see what standards our cards are allowed in, rank by amount
        for (var i=0; i<cardData[card].standards.length; i++) {
          standard = cardData[card].standards[i];
          if (cardsToIgnore.indexOf(card) === -1) {
            currStandard = standardsInDeck.filter( stdObj => stdObj.standard === standard )[0];
            if (currStandard !== undefined) {
              currStandard.amount += 1;
            } else {
              standardsInDeck.push({
                standard,
                amount: 1
              });
            }
          }
        }
        this.size += this.cards[card].amount
      }
    }

    standardsInDeck = standardsInDeck
      .sort( (a,b) => b.amount - a.amount )
      .filter( stdObj => stdObj.amount > 4);

    // see which standards are in all cardData[card].standards
    this.legalStandards = [];
    var currStdIsLegal = true;

    for (var i=0; i<standardsInDeck.length; i++) {
      currStandard = standardsInDeck[i];

      for (card in this.cards) {
        if (this.cards.hasOwnProperty(card)) {
          if (cardData[card].standards.indexOf(currStandard.standard) === -1) {
            currStdIsLegal = false;
          }
        }
      }
      if (currStdIsLegal) this.legalStandards.push(currStandard.standard);
    }
    if (this.legalStandards.length === 0) this.errors.push("Deck not legal in any historic standards.")
  }

  // do checks for all other formats
  else {
    for (card in this.cards) {
      if (this.cards.hasOwnProperty(card)) {

        // check if card is legal in format
        if (cardData[card].legalities[this.format] !== 'legal') {

          // not legal? maybe is restricted...
          if (cardData[card].legalities[this.format] === 'restricted') {

            // its restricted, but are we playing just one copy?
            if (this.cards[card].amount > 1) {
              this.errors.push( `${card} is restricted.` );
            }
          }
        }
        else {
          // okay, its not legal nor restricted
          this.errors.push( `${card} is not legal in ${this.format}.` );
        }
        this.size += this.cards[card].amount;
      }
    }
  }

  // make sure there is valid amounts per card
  for (card in this.cards) {
    if (this.cards.hasOwnProperty(card)) {
      if (this.cards[card].amount > 4 && CYCHMTFO.indexOf(card) === -1) {
        this.errors.push( `Deck has more than 4 ${card}.` );
      }
    }
  }

  // decksize checks
  if (this.format === 'commander') {
    if (this.size < 99) this.errors.push( `Deck has less than 100 cards.` );
  } else {
    if (this.size < 60) this.errors.push( `Deck has less than 60 cards.` );
  }

  // if no errors were found, the deck must be legal
  if (this.errors.length === 0) {
    this.isLegal = true;
  } else {
    for(var i=0; i<this.errors.length; i++) console.log(this.errors[i])
  }


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
