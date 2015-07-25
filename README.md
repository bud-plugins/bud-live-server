## bud-live-server

live web server plugin for bud.

## Install

```bash
$ npm install bud-live-server
```

## Example

```js
var task = require("bud");
var build = task;
var concat = require("concat");
var server = require("../");

build('dist.js', build.watch('*.js').ignore('dist.js', 'do.js'), function (t) {
  concat(t.files, 'dist.js', t.done);
});

build('dist.css', build.watch('*.css').ignore('dist.css'), function (t) {
  concat(t.files, 'dist.css', t.done);
});

task('index.html', task.watch('index.html'));

task('serve', server('dist.js, dist.css, index.html', './', 'localhost:8080'));
```
