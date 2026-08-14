var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var join = require('path').join
var file = join(__dirname, '..', 'package.json')
var JSONStream = require('../')

test('parse whole document via []', function () {
  var expected = JSON.parse(fs.readFileSync(file))
  var parser = JSONStream.parse([])
  var called = 0

  return new Promise(function (resolve, reject) {
    fs.createReadStream(file).pipe(parser)

    parser.on('data', function (data) {
      called++
      try {
        assert.deepEqual(data, expected)
      } catch (e) { return reject(e) }
    })
    parser.on('error', reject)
    parser.on('end', function () {
      try {
        assert.strictEqual(called, 1)
      } catch (e) { return reject(e) }
      resolve()
    })
  })
})
