var test = require('node:test')
var assert = require('node:assert')
var Parser = require('jsonparse')

/*
 sometimes jsonparse changes numbers slightly.
 assert it round-trips a random float unchanged, repeatedly.
*/
test('jsonparse round-trips a random number unchanged', function () {
  var r = Math.random()
  var p = new Parser()
  var times = 20
  var seen = 0

  p.onValue = function (v) {
    if (typeof v === 'number') {
      assert.strictEqual(v, r)
      seen++
    }
  }

  while (times--) {
    assert.strictEqual(JSON.parse(JSON.stringify(r)), r, 'core JSON')
    p.write(Buffer.from(JSON.stringify([r])))
  }

  assert.ok(seen > 0, 'parser emitted at least one number')
})
