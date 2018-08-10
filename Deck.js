const fs = require('fs');
const sha1 = require('js-sha1');
let BigInteger = require('jsbn').BigInteger;

const update = require('./updateCardData.js');
const updateCardData = () => update.update();

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
  let regexData;
  this.list
    .split('\n')
    .forEach(line => {
      if(line !== '' && line.indexOf('//') === -1) {
        regexData = line.match(/[0-9]+/);
        let name = line.slice(regexData[0].length+regexData.index+1);
        let amount = parseInt(regexData[0])
        this.addCard( name, amount, line.indexOf('SB') === -1 );
      }
    });
}

Deck.prototype.getHash = function() {
  let toHash = [];

  for (card in this.main) {
    if (this.main.hasOwnProperty(card)) {
      for (let i=0; i<this.main[card].amount; i++) {
        toHash.push(card.toLowerCase());
      }
    }
  }

  for (card in this.side) {
    if (this.side.hasOwnProperty(card)) {
      for (let i=0; i<this.side[card].amount; i++) {
        toHash.push(`SB:${card.toLowerCase()}`);
      }
    }
  }

  let sha = sha1.array( toHash.sort().join(';') );
  let bnShaSum = new BigInteger('0');
  let bnShaArr = [];

  for (let i=0; i<5; i++) {
    bnShaArr.push( new BigInteger( sha[i].toString() ) )
  }

  bnShaSum = bnShaSum
    .add( bnShaArr[0].shiftLeft(32) )
    .add( bnShaArr[1].shiftLeft(24) )
    .add( bnShaArr[2].shiftLeft(16) )
    .add( bnShaArr[3].shiftLeft( 8) )
    .add( bnShaArr[4] );

  this.hash = bnShaSum.toString(32);
}

Deck.prototype.check = function(decklist=undefined,format=undefined) {
  if (decklist) this.decklist = decklist;
  if (format) this.format = format;
  this.parseList();
  this.getHash();
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

  let cardsToIgnore = [
    'Island',
    'Plains',
    'Swamp',
    'Forest',
    'Mountain',
    'Wastes'
  ];

  const cardData = JSON.parse(fs.readFileSync(`./json/cardData.json`));

  if (this.format === 'historic') {
    const historic = JSON.parse(fs.readFileSync(`./json/historic.json`));
    let standardsInDeck = [];
    let standard, currStandard, errMsg;

    for (card in this.cards) {
      if (this.cards.hasOwnProperty(card)) {

        if (cardsToIgnore.indexOf(card) === - 1) {
          
          // see what standards our cards are allowed in
          for (let i=0; i<cardData[card].standards.length; i++) {

            standard = cardData[card].standards[i];

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
      }
      this.size += this.cards[card].amount
    }

    // grab relevant standards
    standardsInDeck = standardsInDeck
      .sort( (a,b) => b.amount - a.amount )
      .filter( stdObj => stdObj.amount > 4);

    // see which standards are in all cardData[card].standards
    this.legalStandards = [];
    let currStdIsLegal = true;

    for (let i=0; i<standardsInDeck.length; i++) {
      currStandard = standardsInDeck[i];

      for (card in this.cards) {
        if (this.cards.hasOwnProperty(card) && cardsToIgnore.indexOf(card) === - 1) {

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

        if (cardsToIgnore.indexOf(card) === -1) {

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
    for(let i=0; i<this.errors.length; i++) console.log(this.errors[i])
  }

}

module.exports = {
  Deck,
  updateCardData
}
