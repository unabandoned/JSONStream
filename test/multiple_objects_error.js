var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var net = require('net')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'all_npm.json')
var JSONStream = require('../')

// A complete document followed by a stray '}' is invalid trailing input; the
// parser must surface an 'error' rather than silently ending.
test('emits error on invalid trailing input', function () {
  var str = fs.readFileSync(file)

  return new Promise(function (resolve, reject) {
    var errored = false
    var server = net.createServer(function (client) {
      var parser = JSONStream.parse()
      parser.on('error', function () {
        errored = true
        server.close()
        resolve()
      })
      parser.on('end', function () {
        server.close()
        if (!errored) reject(new Error('expected an error on invalid input'))
      })
      client.pipe(parser)
    })

    server.on('error', reject)
    server.listen(0, function () {
      var port = server.address().port
      var client = net.connect({ port: port }, function () {
        client.end(str + '}')
      })
      client.on('error', reject)
    })
  })
})
