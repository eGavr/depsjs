var _ = require('lodash'),
    utils = require('../utils');

var normalize = module.exports = function(dep, entity) {
    if(!dep) {
        return [];
    }

    if(_.isString(dep)) {
        return [{block: dep}];
    }

    entity = entity || {};

    var tech = dep.tech,
        block = dep.block,
        elems = dep.elems || dep.elem,
        mods = dep.mods || dep.mod;

    if((mods || tech) && !elems && !block) {
        elems = entity.elem;
    }

    block = block || entity.block;

    var tech_ = normalizeItem('tech', tech),
        block_ = normalizeItem('block', block),
        elems_ = normalizeElems(elems),
        mods_ = normalizeMods(mods);

    var normalized = [];

    if(_.isArray(elems)) {
        normalized.push(combine(tech_, block_, elems_));

        mods_.length && normalized.push(combine(tech_, block_, mods_));

        block_.length && dep.mods && normalized.push(combine(tech_, block_));
    } else {
        normalized.push(combine(tech_, block_, elems_, mods_));

        (block_.length || elems_.length) && dep.mods && normalized.push(combine(tech_, block_, elems_));
    }

    block_.length && dep.elems && normalized.push(combine(tech_, block_));

    return _(normalized)
        .flatten()
        .thru(utils.uniq)
        .sortByAll()
        .value();
};

function normalizeItem(item, value) {
    if(!value) {
        return [];
    }

    return [utils.createMapEntry(item, value)];
}

function normalizeElems(elems) {
    elems = utils.wrapIntoArray(elems);

    return _(elems)
        .compact()
        .map(normalizeElem_)
        .flatten()
        .value();

    function normalizeElem_(elem) {
        if(_.isString(elem)) {
            return {elem: elem};
        }

        return normalize(elem);
    }
}

function normalizeMods(mods) {
    return _(mods)
        .map(normalizeMod_)
        .flatten()
        .value();

    function normalizeMod_(modVal, modName) {
        if(!_.isArray(modVal)) {
            return {mod: utils.createMapEntry(modName, modVal)};
        }

        return _.map(modVal, function(val) {
            return {mod: utils.createMapEntry(modName, val)};
        });
    }
}

function combine() {
    return _(arguments)
        .toArray()
        .filter(_.negate(_.isEmpty))
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
