var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('Array', function() {
  describe('#indexOf()', function() {
    it.only('should return -1 unless present', function() {
      // this test will be run
    });

    it.only('should return the index when present', function() {
      // this test will also be run
    });

    it('should return -1 if called with a non-Array context', function() {
      // this test will not be run
    });
  });
});
