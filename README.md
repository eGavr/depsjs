# depsjs [![Build Status](https://travis-ci.org/eGavr/depsjs.svg)](https://travis-ci.org/eGavr/depsjs) [![Dependency Status](https://david-dm.org/eGavr/depsjs.svg)](https://david-dm.org/eGavr/depsjs) [![devDependency Status](https://david-dm.org/eGavr/depsjs/dev-status.svg)](https://david-dm.org/eGavr/depsjs#info=devDependencies)

Utility for operations with [deps.js](https://ru.bem.info/technology/deps/about/) entities.

## Install

```bash
$ npm install depsjs
```

## Usage

```js
var depsjs = require('depsjs');

var first = {mustDeps: {block: 'b1', elem: 'e1'}},
    second = {mustDeps: {block: 'b1', elems: 'e1'}};

depsjs.difference(first, second); // [{mustDeps: {block: 'b1'}}]
depsjs.intersection(first, second); // [{mustDeps: {block: 'b1', elem: 'e1'}}]
depsjs.subtraction(first, second); // []
depsjs.subtraction(second, first); // [{mustDeps: {block: 'b1'}}]
```

**Note!** Each method can accept the third argument – a BEM-entity for which given `deps.js` contents are written:

```js
{
    block: 'b1',
    elem: 'e1',
    modName: 'm1',
    modVal: 'v1'
}
```
