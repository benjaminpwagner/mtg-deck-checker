const fs = require('fs');

function Deck(decklist, format) {
  this.list = decklist;
  this.format = format;
  this.cards = {};
  this.size = 0;

  this.addCard = (card, amount) => {

    if (this.cards.hasOwnProperty(card)) {
      this.cards[card].amount += parseInt(amount);
    } else {
      this.cards[card] = {
        amount: parseInt(amount),
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

    const cardData = JSON.parse(fs.readFileSync(`cardDataLight.json`));
    for (card in this.cards) {
      if (this.cards.hasOwnProperty(card)) {
        if (cardData[card].legalities[this.format] !== 'legal') {
          if (cardData[card].legalities[this.format] === 'restricted') {
            if (this.cards[card].amount > 1) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
    }

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

    return true;
  }

  this.isLegal = this.check();
}

module.exports = {
  Deck
}
