'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d3Voronoi = require('d3-voronoi');

var _curveStore = require('curve-store');

var _samplers = require('curve-store/lib/samplers');

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _sign = require('./sign');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Premonish = function () {
  function Premonish() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { selectors: [], elements: [] };

    _classCallCheck(this, Premonish);

    this.stopped = false;
    var time = 0;
    var repeatCount = 0;
    var lastIntent = null;
    var elements = [];
    (options.selectors || []).forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        elements.push(el);
      });
    });

    elements = elements.concat(options.elements || []);

    var voronoiPoints = [];
    var scrollLeft = document.body.scrollLeft;
    var scrollTop = document.body.scrollTop;

    elements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      voronoiPoints.push({
        x: scrollLeft + rect.left,
        y: scrollTop + rect.top,
        el: el
      });
      voronoiPoints.push({
        x: scrollLeft + rect.right,
        y: scrollTop + rect.top,
        el: el
      });
      voronoiPoints.push({
        x: scrollLeft + rect.left,
        y: scrollTop + rect.bottom,
        el: el
      });
      voronoiPoints.push({
        x: scrollLeft + rect.right,
        y: scrollTop + rect.bottom,
        el: el
      });
    });

    var v = (0, _d3Voronoi.voronoi)().x(function (d) {
      return d.x;
    }).y(function (d) {
      return d.y;
    });
    var diagram = v(voronoiPoints);

    var store = (0, _curveStore.createStore)({
      position: {
        x: (0, _samplers.linear)('x'),
        y: (0, _samplers.linear)('y')
      },
      velocity: {
        x: (0, _samplers.derivative)('x'),
        y: (0, _samplers.derivative)('y')
      }
    });

    this._onmousemove = document.body.onmousemove;
    document.body.onmousemove = function (e) {
      if (_this.stopped) {
        return;
      }
      scrollLeft = document.body.scrollLeft;
      scrollTop = document.body.scrollTop;

      store.set(time, {
        x: scrollLeft + e.clientX,
        y: scrollTop + e.clientY
      });

      var _store$sample = store.sample(time),
          velocity = _store$sample.velocity,
          position = _store$sample.position;

      var x = position.x + 100 * Math.pow(1 + velocity.x, 2) * (0, _sign.sign)(velocity.x);
      x = Math.max(x, scrollLeft);
      x = Math.min(x, scrollLeft + document.documentElement.clientWidth);

      var y = position.y + 100 * Math.pow(1 + velocity.y, 2) * (0, _sign.sign)(velocity.y);
      y = Math.max(y, scrollTop);
      y = Math.min(y, scrollTop + document.documentElement.clientHeight);

      var closest = diagram.find(x, y);

      if (lastIntent === closest.data.el) {
        repeatCount++;
      } else {
        repeatCount = 0;
      }

      lastIntent = closest.data.el;

      var confidence = 0;
      confidence += Math.min(1, repeatCount / 10);

      var estimate = { x: x, y: y };
      _this._onIntent && _this._onIntent({ el: closest.data.el, confidence: confidence });
      _this._onMouseMove && _this._onMouseMove({ velocity: velocity, position: position, estimate: estimate });
      _this._onmousemove && _this._onmousemove(e);
    };

    var tick = function tick(t) {
      if (_this.stopped) {
        return;
      }
      time = t;
      (0, _raf2.default)(tick);
    };

    (0, _raf2.default)(tick);
  }

  _createClass(Premonish, [{
    key: 'onMouseMove',
    value: function onMouseMove(callback) {
      this._onMouseMove = callback;
    }
  }, {
    key: 'onIntent',
    value: function onIntent(callback) {
      this._onIntent = callback;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.stopped = true;
      document.body.onmousemove = this._onmousemove;
    }
  }]);

  return Premonish;
}();

exports.default = Premonish;