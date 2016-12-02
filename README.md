# premonish
Predict which DOM element a user will interact with next.

[View the demo](https://mathisonian.github.io.com/premonish/)

## Installation

```
$ npm install premonish
```

## Usage

```js
import Premonish from 'premonish';
const premonish = new Premonish({
  selectors: ['a', '.list-of' '.selectors', '.to', '#watch'],
  elements: [] // A list of DOM nodes
});

premonish.onIntent(({el, confidence}) => {
  console.log(el); // The DOM node we suspect the user is about to interact with.
  console.log(confidence); // How confident are we about the user's intention? Scale 0-1
});
```

## API

### Initialization

```js
var premonish = new Premonish({
  selectors: [], // list of selectors
  elements: [] // A list of DOM nodes
});
```

At least one of `selectors` or `elements` is required.

### Predicting interaction

The `onIntent` callback will be called when `premonish` thinks that a user is likely going to interact with
one of the watched elements.

```js
premonish.onIntent(({el, confidence}) => {
  // el is the expected DOM element
  // confidence is a score from 0-1 on how confident we are in this prediction.
});
```

### More information

The `onMouseMove` callback allows users to look at some of the internal calculations that `premonish` is making.

```js
premonish.onMouseMouse(({ position, velocity, expected }) => {
  // Each value is an object { x: number, y: number }.
  // `expected` is the approximate point premonish thinks the
  // user is moving the mouse to.
});
```

### Stop watching

Call `stop()` when you are done using the library to cleanup the events it is using.

```js
premonish.stop();
```

## About

#### What does it do?

You give it a list of elements and it will try to predict when a user is about to mouse over one of those elements.

#### How does it work?

It's pretty naive, it just looks at the velocity and position of the mouse and tries to find the element that you are probably
moving towards based on that.

#### Is it just a voronoi?

It uses a voronoi under the hood, but instead if looking at current mouse position it looks at expected mouse position. In my
testing this seems strictly better than the voronoi / bubble cursor technique.

#### Why do I want this?

You could use it to perform some optimizations, maybe similar to [instantclick](http://instantclick.io/).

#### Whats with the name?

The library has these premonitions, but they aren't always right.

## Author

Matthew Conlen (github@mathisonian.com)

## LICENSE

MIT