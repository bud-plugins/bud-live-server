var serve = require("just-a-server");
var WebSocket = require("faye-websocket");
var debounce = require("debounce-fn");
var pubsub = require("pubsub");
var path = require("path");
var fs = require("fs");
var debug = require("local-debug")('index');
var client = fs.readFileSync(path.join(__dirname, 'live-client.js')).toString();

plugin.title = 'Live Server';
plugin.disableWatch = false;
plugin.disableIgnore = false;
plugin.params = [
  { name: 'Tasks to watch', desc: 'Separate with comma' },
  { name: 'Folder to serve', desc: 'e.g ./public' },
  { name: 'Hostname:Port', desc: 'Default is localhost:8000' }
];

module.exports = plugin;

function plugin (tasks, folder, hostname) {
  var subscribe = tasks.trim().split(/,\s*/);
  var sockets = [];

  return function (t) {
    var onUpdate = pubsub();

    var server = serve(folder, hostname || 'localhost:8000', function (path, req, res) {
      if (path == '' || path == 'index.html') {
        index(folder, req, res);
        return true;
      }
    });

    subscribe.forEach(function (name) {
      var task = t.tasks.get(name);

      if (!task) {
        console.error('Failed to watch non existing task %s', name);
        return;
      }

      task.watch(function () {
        debug('  Watching task "%s"', name);
      });

      task.onAfterRun.subscribe(function () {
        onUpdate.publish();
      });
    });

    server.on('upgrade', function (req, socket, body) {
      if (!WebSocket.isWebSocket(req)) return;

      var ws = new WebSocket(req, socket, body);
      var ind = sockets.push(ws) - 1;

      onUpdate.subscribe(notify);

      ws.on('close', function (event) {
        ws = null;
        sockets[ind] = undefined;
        onUpdate.unsubscribe(notify);
      });

      function notify () {
        console.log('notify');
        ws.send(JSON.stringify({ restart: true }));
      }
    });
  };
}

function index (folder, req, res) {
  var filename = path.join(folder, 'index.html');

  fs.readFile(filename, function (error, html) {
    if (error) html = '<html><body>404 - Missing ' + filename + '</body></html>';
    res.end(modifyIndex(html.toString()));
  });
}

function modifyIndex (html) {
  var add = '\n<script type="text/javascript">' + client + '</script>';
  if (html.indexOf('</body') == -1) return html + add;
  return html.replace('</body>', add + '</body');
}
