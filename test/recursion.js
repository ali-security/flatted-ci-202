var Flatted = require('../cjs');

var AMOUNT = 5500;

// Build a chain of 5500 linked objects
var chain = ["leaf"];
for (var i = 0; i < AMOUNT; i++) {
  chain = [chain];
}

var str = Flatted.stringify(chain);
console.log('stringify', '✅');
// console.log(str);

var parsed = Flatted.parse(str);

var current = parsed;
for (var i = 0; i < AMOUNT; i++) {
  current = current[0];
}
console.log(current);
console.log('parse', '✅');
