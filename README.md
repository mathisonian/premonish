# premonish
Predict which DOM element a user will interact with next.


## Installation

```
$ npm install premonish
```

## Usage

```js
var Premonish = require('premonish');
var premonish = new Premonish({
  selectors: ['a', '.list-of' '.selectors', '.to', '#watch'],
  elements: [] // A list of DOM nodes
});

premonish.onIntent(function(el, confidence) {
  console.log(el); // The DOM node we suspect the user is about to interact with.
  console.log(confidence); // How confident are we about the user's intention? Scale 0-1
});
```

## LICENSE

MIT