import Shape from './Shape.js';

export default class Circle extends Shape {
  #radius;
  #color;

  constructor(x, y, radius, color = "red") {
    super(x, y);
    this.#radius = radius;
    this.#color = color;
  }

  draw(canvas) {
    let svg = document.createElement("svg");
    svg.width = "300px";
    svg.height = "300px";
    canvas.appendChild(svg);
  }
}
