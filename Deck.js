const fs = require('fs');

function Deck(decklist, format) {
  this.list = decklist;
  this.format = format;
  this.cards = {};
  this.size = 0;

  this.addCard = (card, amount) => {
    const cardName = card
      .toLowerCase()
      .replace(/[ -!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/gi, '');

    if (this.cards.hasOwnProperty(cardName)) {
      this.cards[cardName].amount += parseInt(amount);
    } else {
      this.cards[cardName] = {
        amount: parseInt(amount),
        name: card
      }
    }
  }

  this.parseList = () => {
    this.cards = {};
    this.list
      .split('\n')
      .forEach(line => {
        if(line !== '' && line.indexOf('//') === -1) {
          const regexData = line.match(/[0-9]+/);
          name = line.slice(regexData[0].length+regexData.index+1);
          this.addCard(name, regexData[0]);
        }
      });
  }

  this.parseList();

  this.check = () => {
    this.size = 0;

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
        if (this.cards[card].amount > 4 && CYCHMTFO.indexOf(card) === -1) {
          return false;
        }
        this.size += this.cards[card].amount
      }
    }

    if (format === 'commander') {
      if (this.size < 99) return false;
    } else {
      if (this.size < 60) return false;
    }

    const whitelist = JSON.parse(fs.readFileSync(`./whitelists/${this.format}.json`));
    for (card in this.cards) {
      if (this.cards.hasOwnProperty(card)) {
        if (whitelist.indexOf(this.cards[card].name) === -1) {
          if (format === 'vintage') {
            // add special checks
          } else {
            return false;
          }
        }
      }
    }
    return true;
  }

  this.isLegal = this.check();
}

module.exports = {
  Deck
}
