var shoe = require('shoe'),
    http = require('http'),
    LevelLively = require('level-lively'),
    level = require('level'),
    LivelyStream = require('livelystream'),
    JSONStream = require('JSONStream');

var ecstatic = require('ecstatic')(__dirname + '/app');

var server = http.createServer(ecstatic);
server.listen(process.env.port || 3000);

var ldb = new LevelLively(level('./mydb', { valueEncoding: 'json' }));

var sock = shoe(function (stream) {
  var ls = new LivelyStream(ldb);
  ls
    .pipe(JSONStream.stringify('', '', ''))
    .pipe(stream)
    .pipe(JSONStream.parse())
    .pipe(ls);
});
sock.install(server, '/replicate');
