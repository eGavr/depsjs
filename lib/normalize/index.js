var _ = require('lodash'),
    normalize = require('./normalize'),
    utils = require('../utils');

module.exports = function(deps, entity) {
    entity = entity || {};

    deps = utils.wrapIntoArray(deps);

    return _(deps)
        .map(function(dep) {
            return processDep(dep, entity);
        })
        .groupBy(function(dep) {
            return [dep.block, dep.elem, dep.mod, dep.val].join(',');
        })
        .map(_.identity)
        .map(mergeDeps)
        .map(removeSelfNoDeps)
        .filter(utils.isNotEmpty)
        .value();
};

function processDep(dep, entity) {
    entity = utils.withoutEmpty(revealEntity(dep, entity));

    return utils.withoutEmpty({
        tech:  dep.tech,
        block: entity.block,
        elem:  entity.elem,
        mod:   entity.mod,
        val:   entity.val,
        mustDeps:   normalizeDeps(dep.mustDeps, entity),
        shouldDeps: normalizeDeps(dep.shouldDeps, entity),
        noDeps:     normalizeDeps(dep.noDeps, entity)
    });
}

function revealEntity(dep, entity) {
    if(dep.block && dep.block !== entity.block) {
        return {block: dep.block, elem: dep.elem, mod: dep.mod, val: dep.val};
    }

    if(dep.elem && dep.elem !== entity.elem) {
        return {block: entity.block, elem: dep.elem, mod: dep.mod, val: dep.val};
    }

    if(dep.mod && dep.mod !== entity.modName) {
        return {block: entity.block, elem: entity.elem, mod: dep.mod, val: dep.val};
    }

    if(dep.val && dep.val !== entity.modVal) {
        return {block: entity.block, elem: entity.elem, mod: entity.modName, val: dep.val};
    }

    return {block: entity.block, elem: entity.elem, mod: entity.modName, val: entity.modVal};
}

function normalizeDeps(deps, entity) {
    deps = utils.wrapIntoArray(deps);

    return _(deps)
        .map(function(dep) {
            return normalize(dep, entity);
        })
        .flatten()
        .thru(utils.uniq)
        .value();
}

function mergeDeps(arr) {
    return _.reduce(arr, function(res, deps) {
        return _.merge(res, deps, function(a, b) {
            if(_.isArray(a) && _.isArray(b)) {
                return a.concat(b);
            }
        });
    }, {});
}

function removeSelfNoDeps(dep) {
    var toRemove = _.filter(dep.noDeps, function(noDep) {
        return utils.find(dep.mustDeps, noDep) || utils.find(dep.shouldDeps, noDep);
    });

    ['mustDeps', 'shouldDeps', 'noDeps'].forEach(function(depType) {
        dep[depType] = utils.difference(toRemove, dep[depType]);
    });

    return utils.withoutEmpty(dep);
}
