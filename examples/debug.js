// Import libraries
import Premonish from '../src';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';

import './debug.css';

const intro = `
<div class="intro">
  <h1>
    Premonish
  </h1>
  <div>
    A library for predicting what element a user will interact with next.<br/>Read more on <a href="https://github.com/mathisonian/premonish">github</a>.
    <br/><br/>
    <span class="debug">Show debug view</span>
  </div>
</div>
`;

const ribbon = `
<a class="github-ribbon" href="https://github.com/mathisonian/premonish"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"></a>
`;


const createFromString = (str) => {
  var temp = document.createElement('div');
  temp.innerHTML = str;
  while(temp.firstChild) {
    document.body.appendChild(temp.firstChild);
  }
}

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
const size = 50;
elements.push(createDiv(size, size, size, size, 'orange'));
// elements.push(createDiv(width - 2 * size, size, size, size, 'green'));
elements.push(createDiv(size, height - 2 * size, size, size, 'blue'));
elements.push(createDiv(width / 2 - size / 2, height / 2 - size / 2, size, size, 'black'));
elements.push(createDiv(width - 2 * size, height - 2 * size, size, size, 'purple'));


const svg = select('body').append('svg')
    .attr('opacity', 0)
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', 0)
    .style('bottom', 0);


const line = svg.append('line').attr('stroke', 'rgb(0, 0, 0)').attr('opacity', 0.4).attr('stroke-width', 2);
const circle = svg.append('circle').attr('fill', 'rgb(0, 0, 0)').attr('opacity', 0.4).attr('r', 10);


createFromString(intro);
createFromString(ribbon);

let debug = false;
select('.debug')
  .on('click', () => {
    console.log('click');
    debug = !debug;
    svg.attr('opacity', debug ? 1 : 0);
    select('.debug').style('background', debug ? 'rgb(0, 100, 0)' : 'rgb(100, 100, 100)');
  });



elements.push(document.querySelector('.github-ribbon img'));

const premonish = new Premonish({
  elements: elements
});

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

premonish.onIntent(({ el, confidence }) => {
  elements.forEach((e) => { e.style.border = 'none'; });

  if (confidence > 0.3) {
    el.style.border = 'solid 4px lightgreen';
    circle.attr('fill', el.style.background)
  } else {
    circle.attr('fill', 'rgb(0, 0, 0)')
  }
});
