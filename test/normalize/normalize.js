var normalize = require('../../lib/normalize/normalize');

describe('normalize', function() {
    function test(entity, result) {
        normalize(entity).should.be.eql(result ? result : [entity]);
    }

    it('should not change simple entities', function() {
        test({block: 'b'});
        test({block: 'b', elem: 'e'});
        test({block: 'b', mod: 'm'});
        test({block: 'b', mod: 'm', val: true});
        test({block: 'b', mod: 'm', val: 'v'});
        test({block: 'b', elem: 'e', mod: 'm'});
        test({block: 'b', elem: 'e', mod: 'm', val: true});
        test({block: 'b', elem: 'e', mod: 'm', val: 'v'});
    });

    it('should normalize mods correctly', function() {
        test({block: 'b', mods: {m: 'v'}}, [{block: 'b', mod: 'm', val: 'v'}, {block: 'b', mod: 'm'}, {block: 'b'}]);
        test({block: 'b', mods: {m1: true, m2: ['v1', 'v2']}},
            [{block: 'b', mod: 'm1', val: true}, {block: 'b', mod: 'm1'},
             {block: 'b', mod: 'm2', val: 'v1'}, {block: 'b', mod: 'm2', val: 'v2'}, {block: 'b', mod: 'm2'},
             {block: 'b'}]);
    });

    it('should normalize elems correctly', function() {
        test({block: 'b', elems: 'e'}, [{block: 'b', elem: 'e'}, {block: 'b'}]);
        test({block: 'b', elems: ['e1', 'e2']}, [{block: 'b', elem: 'e1'}, {block: 'b', elem: 'e2'}, {block: 'b'}]);
        test({block: 'b', elems: 'e', mod: 'm'}, [{block: 'b', elem: 'e'}, {block: 'b', mod: 'm'}, {block: 'b'}]);
        test({block: 'b', elems: {elem: 'e', mod: 'm'}},
            [{block: 'b', elem: 'e', mod: 'm'}, {block: 'b'}]);
        test({block: 'b', elems: {elem: 'e', mod: 'm', val: 'v'}},
            [{block: 'b', elem: 'e', mod: 'm', val: 'v'}, {block: 'b'}]);
        test({block: 'b', elems: {elem: 'e', mods: {m: 'v'}}}, [{block: 'b', elem: 'e', mod: 'm', val: 'v'},
            {block: 'b', elem: 'e', mod: 'm'}, {block: 'b', elem: 'e'}, {block: 'b'}]);
    });
});
