var test = require('node:test')
var fs = require('fs')
var net = require('net')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'all_npm.json')
var JSONStream = require('../')

// A parser piped from a socket that is half-closed part-way through the stream
// must still emit 'end' (rather than hanging) when the socket ends.
test('parser emits end when the source socket half-closes', function () {
  return new Promise(function (resolve, reject) {
    var server = net.createServer(function (client) {
      var parser = JSONStream.parse([])
      parser.on('end', function () {
        server.close()
        resolve()
      })
      parser.on('error', function (err) {
        server.close()
        reject(err)
      })
      client.pipe(parser)
      var n = 4
      client.on('data', function () {
        if (--n) return
        client.end()
      })
    })

    server.on('error', reject)
    server.listen(0, function () {
      var port = server.address().port
      var client = net.connect({ port: port }, function () {
        fs.createReadStream(file).pipe(client)
      })
      client.on('error', reject)
    })
  })
})
