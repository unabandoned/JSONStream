var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'all_npm.json')
var JSONStream = require('../')

test('recursive descent via rows..rev', function () {
  var expected = JSON.parse(fs.readFileSync(file))
  var parser = JSONStream.parse('rows..rev')
  var parsed = []

  return new Promise(function (resolve, reject) {
    fs.createReadStream(file).pipe(parser)

    parser.on('data', function (data) { parsed.push(data) })
    parser.on('error', reject)
    parser.on('end', function () {
      try {
        assert.strictEqual(parsed.length, expected.rows.length)
        for (var i = 0; i < expected.rows.length; i++)
          assert.deepEqual(parsed[i], expected.rows[i].value.rev)
      } catch (e) { return reject(e) }
      resolve()
    })
  })
})
