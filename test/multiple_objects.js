var test = require('node:test')
var assert = require('node:assert')
var fs = require('fs')
var net = require('net')
var join = require('path').join
var file = join(__dirname, 'fixtures', 'all_npm.json')
var JSONStream = require('../')

// Three whitespace-separated copies of the same document on one stream: every
// key must be parsed out of each copy, so each distinct value is seen >= 3x.
test('parses multiple whitespace-separated documents', function () {
  var str = fs.readFileSync(file)
  var datas = {}

  return new Promise(function (resolve, reject) {
    var server = net.createServer(function (client) {
      var parser = JSONStream.parse(['rows', true, 'key'])
      parser.on('data', function (data) {
        datas[data] = (datas[data] || 0) + 1
        try {
          assert.strictEqual(typeof data, 'string')
        } catch (e) { return reject(e) }
      })
      parser.on('error', function (err) { server.close(); reject(err) })
      parser.on('end', function () {
        var min = Infinity
        for (var d in datas)
          min = min > datas[d] ? datas[d] : min
        server.close()
        try {
          assert.strictEqual(min, 3)
        } catch (e) { return reject(e) }
        resolve()
      })
      client.pipe(parser)
    })

    server.on('error', reject)
    server.listen(0, function () {
      var port = server.address().port
      var client = net.connect({ port: port }, function () {
        var msgs = str + ' ' + str + '\n\n' + str
        client.end(msgs)
      })
      client.on('error', reject)
    })
  })
})
