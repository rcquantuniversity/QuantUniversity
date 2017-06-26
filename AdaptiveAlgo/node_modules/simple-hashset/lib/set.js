/**
 * set.js
 * ------
 * Simple set implementation
 * Author: Johann-Michael Thiebaut <johann.thiebaut@gmail.com>
 */

/**
 * Set class
 * @that another set to copy or elements to populate the set
 */
var Set = function(that) {
  this.set = {};

  if (that instanceof Set) {
    this.add.apply(this, that.toArray())
  } else {
    this.add.apply(this, arguments)
  }
};

/**
 * Returns `true` iff the set is empty
 */
Set.prototype.isEmpty = function() {
  for (elem in this.set) {
    if (this.contains(elem)) {
      return false
    }
  }
  return true
};

/**
 * Returns the number of elements in the set
 */
Set.prototype.size = function() {
  return this.toArray().length
};

/**
 * Returns `true` iff the set contains `elem`
 */
Set.prototype.contains = function(elem) {
  return Object.prototype.hasOwnProperty.call(this.set, elem)
};

/**
 * Adds an arbitrary amount of elements to the set
 */
Set.prototype.add = function() {
  for (i in arguments) {
    if (!this.contains(arguments[i])) {
      this.set[arguments[i]] = true
    }
  }
  return this
};

/**
 * Removes an arbitrary amount of elements to the set
 */
Set.prototype.remove = function() {
  for (i in arguments) {
    if (this.contains(arguments[i])) {
      delete this.set[arguments[i]]
    }
  }
  return this
};

/**
 * Returns an array of elements in the set
 */
Set.prototype.toArray = function() {
  var elems = [];
  for (elem in this.set) {
    if (this.contains(elem)) {
      elems.push(elem)
    }
  }
  return elems
};

/**
 * If you don't like arrays :(
 */
Set.prototype.iterator = function() {
  var elems = this.toArray();
  return {
    next : function() {
      if (elems.length > 0) {
        return { value: elems.shift(), done: elems.length == 0 }
      } else {
        throw new Error('End of iterator')
      }
    }
  }
};

/**
 * Returns a new set containing elements from `this` and `that`
 */
Set.prototype.union = function(that) {
  return Set.prototype.add.apply(new Set(this), that.toArray())
};

/**
 * Returns a new set containing elements from `this`
 * that are not in `that`
 */
Set.prototype.diff = function(that) {
  return Set.prototype.remove.apply(new Set(this), that.toArray())
};

/**
 * Returns a new set containing elements from `this`
 * that are also in `that`
 */
Set.prototype.intersect = function(that) {
  var s = new Set(this);
  for (elem in this.set) {
    if (this.contains(elem) && !that.contains(elem)) {
      delete s.set[elem]
    }
  }
  return s
};

/**
 * Returns a new set containing elements that are in either `this`
 * or `that` but not in both
 */
Set.prototype.delta = function(that) {
  return this.union(that).diff(this.intersect(that))
};

/**
 * Returns true iff `this` is a subset of `that`
 */
Set.prototype.subset = function(that) {
  return this.diff(that).isEmpty()
};

/**
 * Returns true iff `this` is a strict subset of `that`
 */
Set.prototype.strictSubset = function(that) {
  return this.size() < that.size() && this.subset(that)
};

/**
 * Returns true iff `this` is a superset of `that`
 */
Set.prototype.superset = function(that) {
  return that.subset(this)
};

/**
 * Returns true iff `this` is a strict superset of `that`
 */
Set.prototype.strictSuperset = function(that) {
  return this.size() > that.size() && this.superset(that)
};

/**
 * Returns true iff `this` is equal to `that`
 */
Set.prototype.equal = function(that) {
  return this.subset(that) && that.subset(this)
};

/**
 * Returns a new set containing elements flat mapped by `f`
 */
Set.prototype.flatMap = function(f) {
  var s = new Set();
  for (elem in this.set) {
    s = s.union(f(elem))
  }
  return s
};

/**
 * Returns a new set containing elements mapped by `f`
 */
Set.prototype.map = function(f) {
  var s = new Set();
  for (elem in this.set) {
    s.add(f(elem))
  }
  return s
};

/**
 * Export Set class
 */
exports = module.exports = Set;
