var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'header_footer.json')
var JSONStream = require('../')

test('header and footer emitted around rows', function () {
  var expected = JSON.parse(fs.readFileSync(file))
  var parser = JSONStream.parse(['rows', /\d+/ /*, 'value'*/])
  var called = 0
  var headerCalled = 0
  var footerCalled = 0
  var parsed = []

  return new Promise(function (resolve, reject) {
    fs.createReadStream(file).pipe(parser)

    parser.on('header', function (data) {
      headerCalled++
      try {
        assert.deepEqual(data, { total_rows: 129, offset: 0 })
      } catch (e) { return reject(e) }
    })
    parser.on('footer', function (data) {
      footerCalled++
      try {
        assert.deepEqual(data, { foo: { bar: 'baz' } })
      } catch (e) { return reject(e) }
    })
    parser.on('data', function (data) {
      called++
      try {
        assert.strictEqual(typeof data.id, 'string')
        assert.strictEqual(typeof data.value.rev, 'string')
        assert.strictEqual(typeof data.key, 'string')
        assert.strictEqual(headerCalled, 1)
      } catch (e) { return reject(e) }
      parsed.push(data)
    })
    parser.on('error', reject)
    parser.on('end', function () {
      try {
        assert.strictEqual(called, expected.rows.length)
        assert.strictEqual(headerCalled, 1)
        assert.strictEqual(footerCalled, 1)
        assert.deepEqual(parsed, expected.rows)
      } catch (e) { return reject(e) }
      resolve()
    })
  })
})
