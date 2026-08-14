'use strict'

// Minimal event-stream replacement for the JSONStream test suite.
//
// The round-trip tests were written against a handful of `event-stream`
// helpers (readArray / writeArray / connect). event-stream is abandoned and
// pulled a large tree, so rather than carry it as a dev dependency the exact
// subset the tests use is reimplemented here over node:stream. Behaviour
// matches event-stream: readArray emits each element then 'end', writeArray
// collects every written chunk and hands the array to a callback on 'end', and
// connect pipes a chain of streams together.

var Stream = require('stream')

// A readable stream that emits each element of `array` as a 'data' event, then
// 'end'. Emission is deferred to the next tick so a consumer can attach its
// listeners / be piped first.
exports.readArray = function readArray (array) {
  var stream = new Stream()
  var i = 0
  var paused = false
  var ended = false
  stream.readable = true
  stream.writable = false

  stream.resume = function () {
    if (ended) return
    paused = false
    var l = array.length
    while (i < l && !paused && !ended) {
      stream.emit('data', array[i++])
    }
    if (i === l && !ended) {
      ended = true
      stream.readable = false
      stream.emit('end')
    }
  }
  stream.pause = function () { paused = true }
  stream.destroy = function () { ended = true; stream.emit('close') }
  process.nextTick(stream.resume)
  return stream
}

// A writable stream that buffers every chunk written to it and calls
// done(null, chunks) once end() is reached.
exports.writeArray = function writeArray (done) {
  var stream = new Stream()
  var array = []
  var isDone = false
  stream.writable = true
  stream.readable = false
  stream.write = function (data) { array.push(data); return true }
  stream.end = function (data) {
    if (arguments.length) array.push(data)
    if (isDone) return
    isDone = true
    done(null, array)
  }
  stream.destroy = function () {
    stream.writable = false
    if (isDone) return
    isDone = true
    done(new Error('destroyed before end'), array)
  }
  return stream
}

// Pipe a chain of streams together and return the first one.
exports.connect = function connect () {
  var streams = Array.prototype.slice.call(arguments)
  for (var i = 0; i < streams.length - 1; i++) {
    streams[i].pipe(streams[i + 1])
  }
  return streams[0]
}
