var _ = require('lodash'),
    normalize = require('./normalize'),
    utils = require('./utils');

module.exports = function(firstSet, secondSet, entity) {
    firstSet = firstSet || {};
    secondSet = secondSet || {};
    entity = entity || {};

    var firstSet_ = normalize(firstSet, entity),
        secondSet_ = normalize(secondSet, entity);

    return _(secondSet_)
        .map(findDiff_)
        .flatten()
        .map(removeUnnecessaryDecls_)
        .value();

    function findDiff_(depFromSecondSet) {
        var common = findCommon(firstSet_, depFromSecondSet);

        if(!common) {
            return depFromSecondSet;
        }

        var diffMustDeps = findDiff(common.mustDeps, depFromSecondSet.mustDeps),
            diffShouldDeps = findDiff(common.shouldDeps, depFromSecondSet.shouldDeps),
            diffNoDeps = findDiff(common.noDeps, depFromSecondSet.noDeps);

        if(_.isEmpty(diffMustDeps) && _.isEmpty(diffShouldDeps) && _.isEmpty(diffNoDeps)) {
            return [];
        }

        return utils.withoutEmpty({
            tech:  depFromSecondSet.tech,
            block: depFromSecondSet.block,
            elem:  depFromSecondSet.elem,
            val:   depFromSecondSet.val,
            mod:   depFromSecondSet.mod,
            mustDeps:   diffMustDeps,
            shouldDeps: diffShouldDeps,
            noDeps:     diffNoDeps
        });
    }

    function removeUnnecessaryDecls_(dep) {
        return dep.block === entity.block
            && dep.elem === entity.elem
            && dep.mod === entity.modName
            && dep.val === entity.modVal
            ? _.omit(dep, ['block', 'elem', 'mod', 'val'])
            : dep;
    }
};

function findCommon(set, dep) {
    return _.findWhere(set, utils.withoutEmpty({
        tech:  dep.tech,
        block: dep.block,
        elem:  dep.elem,
        mod:   dep.mod,
        val:   dep.val
    }));
}

function findDiff(firstSet, secondSet) {
    return _.filter(secondSet, function(depFromSecondSet) {
        return !_.find(firstSet, function(depFromFirstSet) {
            return _.isEqual(depFromFirstSet, depFromSecondSet);
        });
    });
}
