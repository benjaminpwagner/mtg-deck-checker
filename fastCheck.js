const fs = require('fs');

var check = (decklist, format) => {
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
  const whitelist = JSON.parse(fs.readFileSync(`./whitelists/${format}.json`));
  var deckSize = 0;
  var cardlist = decklist.split('\n');
  for (var i=0; i<cardlist.length; i++) {
    if(cardlist[i] !== '' && cardlist[i].indexOf('//') === -1) {
      const regexData = cardlist[i].match(/[0-9]+/);
      amount = regexData[0];
      cardName = cardlist[i].slice(amount.length + regexData.index + 1);
      if (whitelist.indexOf(cardName) === -1) return false;
      if (amount > 4) {
        if (CYCHMTFO.indexOf(cardName) === -1) return false;
      }
      deckSize += amount;
    }
  }

  if (format === 'commander') {
    return deckSize >= 99;
  } else {
    return deckSize >= 60;
  }
}

module.exports = {
  check
}
