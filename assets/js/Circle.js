import Shape from './Shape.js';

export default class Circle extends Shape {
  #radius;
  #color;

  constructor(x, y, radius, color = "red") {
    super(x, y);
    this.#radius = radius;
    this.#color = color;
  }

  draw(svg) {
    let circle = document.createElementNS(this.namespace, 'circle');
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", this.y);
    circle.setAttribute("r", this.#radius);
    circle.setAttribute("fill", this.#color);
    svg.appendChild(circle);
    this.element = circle;
  }
}
