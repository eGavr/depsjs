var _ = require('lodash'),
    utils = require('../utils');

var normalize = module.exports = function(dep, entity) {
    if(!dep) {
        return [];
    }

    if(_.isString(dep)) {
        return [{block: dep}];
    }

    var revealedDep = revealDep(dep, entity),
        normalizedDep = normalize_(revealedDep);

    return _(normalizedDep)
        .flatten()
        .thru(utils.uniq)
        .sortByAll()
        .value();

    function normalize_(revealedDep) {
        var normalized = [];

        if(dep.elems) {
            normalized.push(combine(revealedDep.tech, revealedDep.block, revealedDep.elems));

            revealedDep.mods.length && normalized.push(combine(revealedDep.tech, revealedDep.block, revealedDep.mods));

            revealedDep.block.length && dep.mods && normalized.push(combine(revealedDep.tech, revealedDep.block));
        } else {
            normalized.push(combine(revealedDep.tech, revealedDep.block, revealedDep.elems, revealedDep.mods));

            (revealedDep.block.length || revealedDep.elems.length)
                && dep.mods && normalized.push(combine(revealedDep.tech, revealedDep.block, revealedDep.elems));
        }

        revealedDep.block.length && dep.elems && normalized.push(combine(revealedDep.tech, revealedDep.block));

        return normalized;
    }
};

function revealDep(dep, entity) {
    entity = entity || {};

    var tech = dep.tech,
        block = dep.block,
        elems = dep.elems || dep.elem,
        mods = dep.mods || dep.mod,
        val = dep.val;

    if((mods || tech) && !elems && !block) {
        elems = entity.elem;
    }

    block = block || entity.block;

    return {
        tech: revealItem('tech', tech),
        block: revealItem('block', block),
        elems: revealElems(elems),
        mods: revealMods(mods, val)
    };
}

function revealItem(item, value) {
    return value && [utils.createMapEntry(item, value)] || [];
}

function revealElems(elems) {
    elems = utils.wrapIntoArray(elems);

    return _(elems)
        .map(revealElem_)
        .flatten()
        .value();

    function revealElem_(elem) {
        return _.isString(elem) && {elem: elem} || normalize(elem);
    }
}

function revealMods(mods, val) {
    if(_.isString(mods)) {
        return [val ? {mod: mods, val: val} : {mod: mods}];
    }
    mods = utils.wrapIntoArray(mods);

    return _(mods)
        .map(revealModsObj_)
        .flattenDeep()
        .value();

    function revealModsObj_(mods) {
        return _.map(mods, function(modVal, modName) {
            return _.map([].concat(modVal), function(val) {return {mod: modName, val: val};})
                .concat({mod: modName});
        });
    }
}

function combine() {
    return _(arguments)
        .toArray()
        .filter(utils.isNotEmpty)
        .reverse()
        .thru(function(arrs) {
            return _.reduce(_.tail(arrs), function(result, arr) {
                return combine_(arr, result);
            }, _.head(arrs) || []);
        })
        .value();

    function combine_(first, second) {
        return _(first)
            .map(function(i) {
                return _.map(second, function(j) {
                    return _.merge(_.clone(i), j);
                });
            })
            .flatten()
            .value();
    }
}
