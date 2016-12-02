// Import libraries
import Premonish from '../src';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';

const createDiv = (x, y, sizeX, sizeY, color) => {
  const div = document.createElement('div');
  div.style.width = sizeX + 'px';
  div.style.height = (sizeY || sizeX) + 'px';
  div.style.position = 'absolute';
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  div.style.boxSizing = 'border-box';
  div.style.background = color || 'lightblue';
  document.body.appendChild(div);
  return div;
}

document.body.style.padding = 0;
document.body.style.margin = 0;

const width = window.innerWidth;
const height = window.innerHeight;
createDiv(0, 0, width, height, 'white');
let elements = [];
const size = 100;
elements.push(createDiv(size, size, size, size, 'orange'));
elements.push(createDiv(width - 2 * size, size, size, size, 'green'));
elements.push(createDiv(size, height - 2 * size, size, size, 'blue'));
elements.push(createDiv(width / 2 - size / 2, height / 2 - size / 2, size, size, 'black'));
elements.push(createDiv(width - 2 * size, height - 2 * size, size, size, 'purple'));

const premonish = new Premonish({
  elements: elements
});

const svg = select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', 0)
    .style('bottom', 0);


const line = svg.append('line').attr('stroke', 'rgb(0, 0, 0)').attr('opacity', 0.4).attr('stroke-width', 2);
const circle = svg.append('circle').attr('fill', 'rgb(0, 0, 0)').attr('opacity', 0.4).attr('r', 10);

premonish.onMouseMove(({ position, velocity, estimate }) => {

  circle
    .transition(transition)
    .duration(25)
    .attr('cx', estimate.x)
    .attr('cy', estimate.y)

  line
    .attr('x1', position.x)
    .attr('y1', position.y)
    .transition(transition)
    .duration(25)
    .attr('x2', estimate.x)
    .attr('y2', estimate.y);
})

premonish.onIntent((el, confidence) => {
  elements.forEach((e) => { e.style.border = 'none'; });
  if (confidence > 0.3) {
    el.style.border = 'solid 8px red';
    circle.attr('fill', el.style.background)
  } else {
    circle.attr('fill', 'rgb(0, 0, 0)')
  }
});


