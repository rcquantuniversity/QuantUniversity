simple-hashset
==============

Simple hashsets for node

## Installation

```bash
npm install simple-hashset
```

## Usage

```js
var Set = require('simple-hashset');

var s = new Set('a', 'b', 'c');

console.log(s.contains('b'));
console.log(s.contains('d'));
```

## Limitations

This package simply uses objects as associative arrays.
Therefore, using sets with objects or functions is not recommended.

## API

### new Set()

```js
var a = new Set();        // Creates an empty set
var b = new Set(1, 2, 4); // Creates a set that contains 1, 2 and 3
var c = new Set(b);       // Creates a copy of set b
```

### Set#isEmpty()

Returns `true` iff the set is empty.

### Set#size()

Returns the cardinality of the set.

### Set#contains(elem)

Returns `true` iff `elem` is an element of the set.

### Set#add()

Adds elements to the set.

```js
var s = new Set(1); // s = { 1 }

s.add(2, 5, 7);     // s = { 1, 2, 5, 7 }
```

### Set#remove()

Removes elements to the set.

```js
var s = new Set(1, 2, 3, 4); // s = { 1, 2, 3, 4 }

s.remove(2, 7);              // s = { 1, 3, 4 }
```

### Set#toArray()

Returns an array containing the elements of the set.
The order of elements is unspecified.

### Set#union(that)

Returns a **new** set containing the elements from `this` and the
elements from `that`.

### Set#diff(that)

Returns a **new** set containing the elements from `this`
which are not in `that`.

### Set#intersect(that)

Returns a **new** set containing the elements from `this`
which are also in `that`.

### Set#delta(that)

Returns a **new** set containing the elements that are in either `this`
or `that` but not in both.
This is the symmetric difference of sets.

### Set#subset(that)

Returns true iff `this` is a subset of `that`.

### Set#strictSubset(that)

Returns true iff `this` is a strict subset of `that`.

### Set#superset(that)

Returns true iff `this` is a superset of `that`.

### Set#strictSuperset(that)

Returns true iff `this` is a strict superset of `that`.

### Set#equal(that)

Returns true iff `this` is equal to `that`.

### Set#map(f)

Returns a new set containing elements mapped by `f`.

```js
var a = new Set(2, 5); // a = { 2, 5 }
var f = function(x) {
  var y = parseInt(x);
  return y+1;
};
var b = a.map(f);      // b = { 3, 6 }
```

### Set#flatMap(f)

Like map but `f` returns sets.

```js
var a = new Set(2, 5);    // a = { 2, 5 }
var f = function(x) {
  var y = parseInt(x);
  return new Set(y, y+3);
};
var b = a.flatMap(f);     // b = { 2, 5, 8 }
```

## License

Copyright (c) 2013 Johann-Michael Thiebaut <[johann.thiebaut@gmail.com](mailto:johann.thiebaut@gmail.com)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
