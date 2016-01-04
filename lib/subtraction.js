var difference = require('./difference');

module.exports = function(firstSet, secondSet, entity) {
    firstSet = firstSet || [];
    secondSet = secondSet || [];
    entity = entity || {};

    return difference(secondSet, firstSet, entity);
};
