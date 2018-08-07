const fs = require('fs');
const sha1 = require('js-sha1');

function Deck(decklist, format) {

  const validFormats = [
      'modern',
      'standard',
      'legacy',
      'vintage',
      'historic',
      'commander',
      'pauper',
  ];

  if (validFormats.indexOf(format.toLowerCase()) === -1) {
    throw(`${format} is not a valid format.`)
  }

  this.list = decklist;
  this.format = format.toLowerCase();

  // default values
  // these values are reset by Deck.check()
  this.cards = {};
  this.main = {};
  this.side = {};
  this.size = 0;
  this.errors = [];
  this.isLegal = false;

  // check the deck and print errors
  this.check();
}

Deck.prototype.addCard = function(card, amount, inMain=true) {
  if (this.cards.hasOwnProperty(card)) {
    this.cards[card].amount += amount;
  } else {
    this.cards[card] = {
      amount: amount
    }
  }

  if (inMain) {

    if (this.main.hasOwnProperty(card)) {
      this.main[card].amount += amount;
    } else {
      this.main[card] = {
        amount: amount
      }
    }

  } else {

    if (this.side.hasOwnProperty(card)) {
      this.side[card].amount += amount;
    } else {
      this.side[card] = {
        amount: amount
      }
    }

  }

}

Deck.prototype.parseList = function() {
  this.cards = {};
  this.main = {};
  this.side = {};
  var regexData;
  this.list
    .split('\n')
    .forEach(line => {
      if(line !== '' && line.indexOf('//') === -1) {
        regexData = line.match(/[0-9]+/);
        var name = line.slice(regexData[0].length+regexData.index+1);
        var amount = parseInt(regexData[0])
        this.addCard( name, amount, line.indexOf('SB') === -1 );
      }
    });

  var toHash = [];

  for (card in this.main) {
    if (this.main.hasOwnProperty(card)) {
      for (var i=0; i<this.main[card].amount; i++) {
        toHash.push(card.toLowerCase());
      }
    }
  }

  for (card in this.side) {
    if (this.side.hasOwnProperty(card)) {
      for (var i=0; i<this.side[card].amount; i++) {
        toHash.push(`SB:${card.toLowerCase()}`);
      }
    }
  }

  toHash = toHash.sort();

  console.log(toHash);

  var sha = sha1.array( toHash.join(';') );
  console.log(sha)
  var byte1 = sha[0] << 32;
  var byte2 = sha[1] << 24;
  var byte3 = sha[2] << 16;
  var byte4 = sha[3] << 8;
  var byte5 = sha[4]
  console.log(byte1, byte2, byte3, byte4, byte5);
  console.log((byte1 + byte2 + byte3 + byte4 + byte5).toString(16));
  console.log((byte1 + byte2 + byte3 + byte4 + byte5).toString(32));
  console.log('558c3e67')
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
    const historic = JSON.parse(fs.readFileSync(`./json/historic.json`));
    var standardsInDeck = [];
    var standard, currStandard, errMsg;
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

        // see what standards our cards are allowed in
        for (var i=0; i<cardData[card].standards.length; i++) {
          standard = cardData[card].standards[i];
          if (cardsToIgnore.indexOf(card) === -1) {
            currStandard = standardsInDeck
              .filter( stdObj => stdObj.standard === standard )[0];
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

    // grab relevant standards
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

          // check for banned cards
          if (historic.banlist.indexOf(card) !== -1) {
            currStdIsLegal = false;
            errMsg = `${card} is banned in historic standard.`
            if (this.errors.indexOf(errMsg) === -1) this.errors.push(errMsg)
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
          if (cardData[card].legalities[this.format] === 'restricted' && this.format === 'vintage') {

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
  }

  // errors were found, this.isLegal remains false and print errors
  else {
    for(var i=0; i<this.errors.length; i++) console.log(this.errors[i])
  }

}

module.exports = {
  Deck
}
