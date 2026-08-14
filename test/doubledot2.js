var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'depth.json')
var JSONStream = require('../')

test('recurse flag via [docs, {recurse:true}, value]', function () {
  var parser = JSONStream.parse(['docs', { recurse: true }, 'value'])
  var parsed = []

  return new Promise(function (resolve, reject) {
    fs.createReadStream(file).pipe(parser)

    parser.on('data', function (data) { parsed.push(data) })
    parser.on('error', reject)
    parser.on('end', function () {
      try {
        var expectedValues = [0, [1], { 'a': 2 }, '3', 4]
        assert.strictEqual(parsed.length, expectedValues.length)
        for (var i = 0; i < expectedValues.length; i++)
          assert.deepEqual(parsed[i], expectedValues[i])
      } catch (e) { return reject(e) }
      resolve()
    })
  })
})
