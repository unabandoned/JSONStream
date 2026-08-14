var test = require('node:test')
var assert = require('node:assert')
var JSONStream = require('../')
var es = require('./lib/event-stream')

function randomObj () {
  return (
    Math.random() < 0.4
      ? {
          hello: 'eonuhckmqjk',
          whatever: 236515,
          lies: true,
          nothing: [null],
          stuff: [Math.random(), Math.random(), Math.random()]
        }
      : ['AOREC', 'reoubaor', { ouec: 62642 }, [[[], {}, 53]]]
  )
}

test('stringifyObject round-trips key/value pairs', function () {
  var runs = 10

  return new Promise(function (resolve, reject) {
    var pending = runs
    for (var ix = 0; ix < runs; ix++) (function (count) {
      var expected = {}
      var stringify = JSONStream.stringifyObject()

      es.connect(
        stringify,
        es.writeArray(function (err, lines) {
          if (err) return reject(err)
          try {
            assert.deepEqual(JSON.parse(lines.join('')), expected)
          } catch (e) { return reject(e) }
          if (--pending === 0) resolve()
        })
      )

      while (count--) {
        var key = Math.random().toString(16).slice(2)
        expected[key] = randomObj()
        stringify.write([key, expected[key]])
      }

      process.nextTick(function () {
        stringify.end()
      })
    })(ix)
  })
})
