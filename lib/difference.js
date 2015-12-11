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
        .map(removeSelfDeps_)
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
        var arr1 = ['block', 'elem', 'mod', 'val'],
            arr2 = ['block', 'elem', 'modName', 'modVal'];

        for(var i = 0; i < arr1.length; i++) {
            var item1 = arr1[i],
                item2 = arr2[i];

            if(dep[item1] !== entity[item2]) {
                break;
            }

            dep = _.omit(dep, item1);
        }

        return dep;
    }

    function removeSelfDeps_(dep) {
        ['mustDeps', 'shouldDeps', 'noDeps'].forEach(function(depType) {
            if(!dep[depType]) {
                return;
            }

            dep[depType] = removeSelfDepsIn_(depType);
        });

        return dep;

        function removeSelfDepsIn_(depType) {
            return _.map(dep[depType], function(dep) {
                if(dep.block === entity.block && dep.elem === entity.elem) {
                    return _.omit(dep, 'block', 'elem');
                }

                if(dep.block === entity.block) {
                    return _.omit(dep,  'block');
                }

                return dep;
            });
        }
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
