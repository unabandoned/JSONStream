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

test('stringify an array of random objects', function () {
  var expected = []
  var stringify = JSONStream.stringify()
  var count = 10
  while (count--) expected.push(randomObj())

  return new Promise(function (resolve, reject) {
    es.connect(
      es.readArray(expected),
      stringify,
      es.writeArray(function (err, lines) {
        if (err) return reject(err)
        try {
          assert.deepEqual(JSON.parse(lines.join('')), expected)
        } catch (e) { return reject(e) }
        resolve()
      })
    )
  })
})
