var difference = require('./difference');

module.exports = function(firstSet, secondSet, entity) {
    var diff = difference(firstSet, secondSet, entity);

    return difference(diff, secondSet, entity);
};
