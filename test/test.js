var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'all_npm.json')
var JSONStream = require('../')

test('parse rows via [rows, /\\d+/]', function () {
  var expected = JSON.parse(fs.readFileSync(file))
  var parser = JSONStream.parse(['rows', /\d+/ /*, 'value'*/])
  var parsed = []

  return new Promise(function (resolve, reject) {
    fs.createReadStream(file).pipe(parser)

    parser.on('data', function (data) {
      try {
        assert.strictEqual(typeof data.id, 'string')
        assert.strictEqual(typeof data.value.rev, 'string')
        assert.strictEqual(typeof data.key, 'string')
      } catch (e) { return reject(e) }
      parsed.push(data)
    })
    parser.on('error', reject)
    parser.on('end', function () {
      try {
        assert.strictEqual(parsed.length, expected.rows.length)
        assert.deepEqual(parsed, expected.rows)
      } catch (e) { return reject(e) }
      resolve()
    })
  })
})
