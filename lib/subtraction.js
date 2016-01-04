var difference = require('./difference');

module.exports = function(firstSet, secondSet, entity) {
    return difference(secondSet, firstSet, entity);
};
