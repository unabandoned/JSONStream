var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'error.json')
var JSONStream = require('../')

test('header emitted, no data, no footer', function () {
  var parser = JSONStream.parse(['rows'])
  var called = 0
  var headerCalled = 0
  var footerCalled = 0

  return new Promise(function (resolve, reject) {
    fs.createReadStream(file).pipe(parser)

    parser.on('header', function (data) {
      headerCalled++
      try {
        assert.deepEqual(data, {
          error: 'error_code',
          message: 'this is an error message'
        })
      } catch (e) { return reject(e) }
    })
    parser.on('footer', function () { footerCalled++ })
    parser.on('data', function () { called++ })
    parser.on('error', reject)
    parser.on('end', function () {
      try {
        assert.strictEqual(called, 0)
        assert.strictEqual(headerCalled, 1)
        assert.strictEqual(footerCalled, 0)
      } catch (e) { return reject(e) }
      resolve()
    })
  })
})
