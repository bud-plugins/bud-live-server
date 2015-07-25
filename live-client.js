/* bud-live-server socket client to refresh when the source code changes */
(function () {

  var connected = false;
  var timer;
  var ws;

  connect();

  function connect () {
    ws = new WebSocket(document.location.origin.replace('http', 'ws'));
    ws.onopen = open;
    ws.onmessage = message;
    ws.onclose = close;
  }

  function open () {
    timer = undefined;
    connected = true;
    clearTimeout(timer);
    console.log('bud-live-server: watching for changes.');
  }

  function message (event) {
    var msg = JSON.parse(event.data);
    document.location.href = document.location.href;
    console.log('bud-live-server: changes has been made, refreshing the page..');
  }

  function close () {
    connected = false;
    if (timer == undefined) reconnect();
  }

  function reconnect () {
    if (connected) return;
    connect();
    timer = setTimeout(reconnect, 1000);
  }

}());
