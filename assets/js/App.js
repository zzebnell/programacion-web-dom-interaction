import Circle from './Circle.js';

console.log("okz");

const svg = document.getElementById("svg-canvas");

const c = new Circle(50, 50, 30, 'red');
c.draw(svg);
