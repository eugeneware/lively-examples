var net = require('net'),
    Stream = require('stream'),
    JSONStream = require('JSONStream'),
    ObserveStream = require('observestream'),
    MemLively = require('memlively'),
    LivelyStream = require('livelystream'),
    repl = require('repl'),
    fs = require('fs');

// Server Logic
var memdb = new MemLively();

var ls = new LivelyStream(memdb);
var server = net.createServer(function (c) {
  ls
    .pipe(JSONStream.stringify('', '', ''))
    .pipe(c)
    .pipe(JSONStream.parse())
    .pipe(ls);
});
server.listen(0, function() { connectClient(); connectClient(); });

function checkDb() {
  console.log(memdb.db);
  //process.exit();
}

function updateDb(cb) {
  memdb.put('eugene', { name: 'Eugene', number: 42 }, function (err) {
    setTimeout(function () {
      cb(err);
    }, 50);
  });
}

// Client Logic
var clients = []
function connectClient() {
  var scope = {};
  var os = new ObserveStream('eugene', scope, 'target', {});

  var client = net.connect(server.address(), function () {
    client.scope = scope;
    clients.push(client);
    console.log('client', client.address());

    client
      .pipe(JSONStream.parse())
      .pipe(os)
      .pipe(JSONStream.stringify('', '', ''))
      .pipe(client);

    client.on('end', function () {
      console.log('endy');
      client.end();
      process.exit();
    });

    updateDb(updateScope);

    function updateScope(err) {
      if (err) throw err;
      scope.target.name = 'Susan'
      setTimeout(checkDb, 50);
    };
  });
}

var cmd = repl.start({ useGlobal: true });
cmd.context.memdb = memdb;
cmd.context.server = server;
cmd.context.clients = clients;
