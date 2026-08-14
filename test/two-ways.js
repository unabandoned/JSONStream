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
          nothing: [null]
        }
      : ['AOREC', 'reoubaor', { ouec: 62642 }, [[[], {}, 53]]]
  )
}

test('stringify then parse([/./]) round-trips the array', function () {
  var expected = []
  var stringify = JSONStream.stringify()
  var count = 10
  while (count--) expected.push(randomObj())

  return new Promise(function (resolve, reject) {
    es.connect(
      es.readArray(expected),
      stringify,
      JSONStream.parse([/./]),
      es.writeArray(function (err, lines) {
        if (err) return reject(err)
        try {
          assert.deepEqual(lines, expected)
        } catch (e) { return reject(e) }
        resolve()
      })
    )
  })
})
