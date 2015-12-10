var _ = require('lodash'),
    normalize = require('./normalize'),
    utils = require('./utils');

module.exports = function(firstSet, secondSet, entity) {
    firstSet = firstSet || [];
    secondSet = secondSet || [];
    entity = entity || {};

    var firstSet_ = normalize(firstSet, entity),
        secondSet_ = normalize(secondSet, entity);

    return _(secondSet_)
        .map(findDiff_)
        .flatten()
        .map(removeSelfDecl_)
        .filter(utils.isNotEmpty)
        .value();

    function findDiff_(depFromSecondSet) {
        var common = findCommon(firstSet_, depFromSecondSet);

        if(!common) {
            return depFromSecondSet;
        }

        var diffMustDeps = utils.difference(common.mustDeps, depFromSecondSet.mustDeps),
            diffShouldDeps = utils.difference(common.shouldDeps, depFromSecondSet.shouldDeps),
            diffNoDeps = utils.difference(common.noDeps, depFromSecondSet.noDeps);

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

    function removeSelfDecl_(dep) {
        return dep.block === entity.block
            && dep.elem === entity.elem
            && dep.mod === entity.modName
            && dep.val === entity.modVal
            ? _.omit(dep, ['block', 'elem', 'mod', 'val'])
            : dep;
    }
};

function findCommon(set, dep) {
    return _.find(set, function(depFromSet) {
        return depFromSet.tech === dep.tech
            && depFromSet.block === dep.block
            && depFromSet.elem === dep.elem
            && depFromSet.mod === dep.mod
            && depFromSet.val === dep.val;
    });
}
