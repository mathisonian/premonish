import { voronoi } from 'd3-voronoi';
import { createStore } from 'curve-store';
import { linear, derivative } from 'curve-store/lib/samplers';
import raf from 'raf';

class Premonish {
  constructor(options = { selectors: [], elements: [] }) {
    // TODO:
    // 5. Make an estimate along the velocity vector about the
    //    final position.
    // 6. Lookup the closest element in the voronoi and check if it is
    //    within a certain threshold.
    // 7. If it is, return that + a confidence score.

    let time = 0;
    let repeatCount = 0;
    let lastIntent = null;
    let elements = [];
    (options.selectors || []).forEach((selector) => {
      elements = elements.concat(document.querySelectorAll(selector));
    });

    elements = elements.concat(options.elements || []);

    const voronoiPoints = [];
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      voronoiPoints.push({
        x: rect.left,
        y: rect.top,
        el: el
      });
      voronoiPoints.push({
        x: rect.right,
        y: rect.top,
        el: el
      });
      voronoiPoints.push({
        x: rect.left,
        y: rect.bottom,
        el: el
      });
      voronoiPoints.push({
        x: rect.right,
        y: rect.bottom,
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


    document.body.onmousemove = (e) => {
      store.set(time, {
        x: e.clientX,
        y: e.clientY
      });

      const { velocity, position } = store.sample(time);

      let x = position.x + 100 * Math.pow(1 + velocity.x, 2) * Math.sign(velocity.x);
      x = Math.max(x, 0);
      x = Math.min(x, window.innerWidth);

      let y = position.y + 100 * Math.pow(1 + velocity.y, 2) * Math.sign(velocity.y);
      y = Math.max(y, 0);
      y = Math.min(y, window.innerHeight);

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
      this._onIntent && this._onIntent(closest.data.el, confidence);
      this._onMouseMove && this._onMouseMove({ velocity, position, estimate });
    };

    raf(function tick (t) {
      time = t;

      raf(tick);
    });
  }

  onMouseMove(callback) {
    this._onMouseMove = callback;
  }

  onIntent(callback) {
    this._onIntent = callback;
  }
};

export default Premonish;