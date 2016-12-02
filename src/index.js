import { voronoi } from 'd3-voronoi';
import { createStore } from 'curve-store';
import { linear, derivative } from 'curve-store/lib/samplers';
import raf from 'raf';

class Premonish {
  constructor(options = { selectors: [], elements: [] }) {
    this.stopped = false;
    let time = 0;
    let repeatCount = 0;
    let lastIntent = null;
    let elements = [];
    (options.selectors || []).forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        elements.push(el);
      });
    });

    elements = elements.concat(options.elements || []);

    const voronoiPoints = [];
    let scrollLeft = document.body.scrollLeft;
    let scrollTop  = document.body.scrollTop;

    elements.forEach((el) => {
      console.log(el);
      const rect = el.getBoundingClientRect();
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

    const v = voronoi().x(d => d.x).y(d => d.y);
    const diagram = v(voronoiPoints);

    const store = createStore({
      position: {
        x: linear('x'),
        y: linear('y')
      },
      velocity: {
        x: derivative('x'),
        y: derivative('y')
      }
    });


    this._onmousemove = document.body.onmousemove;
    document.body.onmousemove = (e) => {
      if (this.stopped) {
        return;
      }
      scrollLeft = document.body.scrollLeft;
      scrollTop  = document.body.scrollTop;

      store.set(time, {
        x: scrollLeft + e.clientX,
        y: scrollTop + e.clientY
      });

      const { velocity, position } = store.sample(time);

      let x = position.x + 100 * Math.pow(1 + velocity.x, 2) * Math.sign(velocity.x);
      x = Math.max(x, scrollLeft);
      x = Math.min(x, scrollLeft + document.documentElement.clientWidth);

      let y = position.y + 100 * Math.pow(1 + velocity.y, 2) * Math.sign(velocity.y);
      y = Math.max(y, scrollTop);
      y = Math.min(y, scrollTop + document.documentElement.clientHeight);

      const closest = diagram.find(x, y);

      if (lastIntent === closest.data.el) {
        repeatCount++;
      } else {
        repeatCount = 0;
      }

      lastIntent = closest.data.el;

      let confidence = 0;
      confidence += Math.min(1, repeatCount / 10);

      const estimate = { x, y };
      this._onIntent && this._onIntent({ el: closest.data.el, confidence: confidence });
      this._onMouseMove && this._onMouseMove({ velocity, position, estimate });
      this._onmousemove && this._onmousemove(e);
    };

    const tick = (t) => {
      if (this.stopped) {
        return;
      }
      time = t;
      raf(tick);
    }

    raf(tick);
  }

  onMouseMove(callback) {
    this._onMouseMove = callback;
  }

  onIntent(callback) {
    this._onIntent = callback;
  }

  stop() {
    this.stopped = true;
    document.body.onmousemove = this._onmousemove;
  }
};

export default Premonish;