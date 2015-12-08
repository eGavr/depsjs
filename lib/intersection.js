var difference = require('./difference');

/**
 *
 */
module.exports = function(firstSet, secondSet, entity) {
    firstSet = firstSet || {};
    secondSet = secondSet || {};
    entity = entity || {};

    var diff = difference(firstSet, secondSet, entity);

    return difference(diff, secondSet, entity);
};
