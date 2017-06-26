/**
 * test.js
 * -------
 * Tests for Sets
 * Author: Johann-Michael Thiebaut <johann.thiebaut@gmail.com>
 */

var should = require('should');

var Set = require('../lib/set');

describe('Set', function() {
  describe('new Set()', function() {
    it('should create empty an empty set when no argument is provided', function() {
      var s = new Set();
      should.strictEqual(s.isEmpty(), true);
      should.strictEqual(s.size(), 0);
    });
    it('should create a set containing the provided arguments', function() {
      var s = new Set('a', 'c');
      should.strictEqual(s.isEmpty(), false);
      should.strictEqual(s.size(), 2);
      should.strictEqual(s.contains('a'), true);
      should.strictEqual(s.contains('b'), false);
      should.strictEqual(s.contains('c'), true);
    });
    it('should copy a set when one is passed as an argument', function() {
      var r = new Set('a', 'c');
      var s = new Set(r);
      should.strictEqual(s.isEmpty(), false);
      should.strictEqual(s.size(), 2);
      should.strictEqual(s.contains('a'), true);
      should.strictEqual(s.contains('b'), false);
      should.strictEqual(s.contains('c'), true);
    })
  });
  describe('#isEmpty()', function() {
    it('should return true iff the set is empty', function() {
      var s = new Set();
      should.strictEqual(s.isEmpty(), true);
      s = new Set('a');
      should.strictEqual(s.isEmpty(), false);
    })
  });
  describe('#size()', function() {
    it('should return the size of the set', function() {
      var s = new Set();
      should.strictEqual(s.size(), 0);
      s = new Set('a');
      should.strictEqual(s.size(), 1);
      s = new Set('a', 'b', 'c', 'd');
      should.strictEqual(s.size(), 4);
    })
  });
  describe('#contains(elem)', function() {
    it('should return true iff elem is an element of the set.', function() {
      var s = new Set('a', 'c');
      should.strictEqual(s.contains('a'), true);
      should.strictEqual(s.contains('b'), false);
      should.strictEqual(s.contains('c'), true);
    })
  });
  describe('#add(elemA, elemB, ...)', function() {
    it('should add elements to the set.', function() {
      var s = new Set('a');
      s.add('a', 'c');
      should.strictEqual(s.isEmpty(), false);
      should.strictEqual(s.size(), 2);
      should.strictEqual(s.contains('a'), true);
      should.strictEqual(s.contains('b'), false);
      should.strictEqual(s.contains('c'), true);
    })
  });
  describe('#remove(elemA, elemB, ...)', function() {
    it('should remove elements from the set.', function() {
      var s = new Set('a', 'c');
      s.remove('b', 'c');
      should.strictEqual(s.isEmpty(), false);
      should.strictEqual(s.size(), 1);
      should.strictEqual(s.contains('a'), true);
      should.strictEqual(s.contains('b'), false);
      should.strictEqual(s.contains('c'), false);
    })
  });
  describe('#toArray()', function() {
    it('should return an array of the elements in the set.', function() {
      var s = new Set('a', 'c');
      var err = 0;
      // Either one should be true
      try {
        should.deepEqual(s.toArray(), ['a', 'c']);
      } catch (e) {
          err++;
      }
      try {
        should.deepEqual(s.toArray(), ['c', 'a']);
      } catch (e) {
          err++;
      }
      if (err !== 1) {
        should.deepEqual(s.toArray(), ['a', 'c']);
      }
    })
  });
  describe('#union(that)', function() {
    it('should return the union of the sets.', function() {
      var r = new Set('a', 'c');
      var s = new Set('a', 'b');
      var t = new Set('a', 'b', 'c');
      should.strictEqual(t.equal(r.union(s)), true);
    })
  });
  describe('#diff(that)', function() {
    it('should return the set difference of the sets.', function() {
      var r = new Set('a', 'b', 'c');
      var s = new Set('a', 'b');
      var t = new Set('c');
      should.strictEqual(t.equal(r.diff(s)), true);
    })
  });
  describe('#intersect(that)', function() {
    it('should return the intersection of the sets.', function() {
      var r = new Set('a', 'b', 'c');
      var s = new Set('b', 'c', 'd');
      var t = new Set('b', 'c');
      should.strictEqual(t.equal(r.intersect(s)), true);
    })
  });
  describe('#delta(that)', function() {
    it('should return the symmetric difference of the sets.', function() {
      var r = new Set('a', 'b', 'c');
      var s = new Set('b', 'c', 'd');
      var t = new Set('a', 'd');
      should.strictEqual(t.equal(r.delta(s)), true);
    })
  });
  describe('#subset(that)', function() {
    it('should return true iff this is a subset of that')
  });
  describe('#strictSubset(that)', function() {
    it('should return true iff this is a strict subset of that')
  });
  describe('#superset(that)', function() {
    it('should return true iff this is a superset of that')
  });
  describe('#strictSuperset(that)', function() {
    it('should return true iff this is a strict superset of that')
  });
  describe('#equal(that)', function() {
    it('should return true iff the sets are equal.', function() {
      var r = new Set('a', 'c');
      var s = new Set('a', 'c');
      var t = new Set('a', 'b', 'c');
      should.strictEqual(r.equal(s), true);
      should.strictEqual(r.equal(t), false);
      should.strictEqual(s.equal(t), false);
    })
  });
  describe('#map(f)', function() {
    it('should return the set of elements mapped by f.', function() {
      var r = new Set('a', 'c');
      var s = r.map(function(x) { return x + '!' });
      var t = new Set('a!', 'c!');
      should.strictEqual(s.equal(t), true);
    })
  });
  describe('#flatMap(f)', function() {
    it('should return the set of elements flat mapped by f.', function() {
      var r = new Set('a', 'ab');
      var s = r.flatMap(function(x) {
        return new Set(x, x + 'b');
      });
      var t = new Set('a', 'ab', 'abb');
      should.strictEqual(s.equal(t), true);
    })
  });
})
