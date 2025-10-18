import Shape from './Shape.js';

export default class Parallelogram extends Shape {
  constructor(x, y, width = 120, height = 60, text = "Entrada/Salida") {
    super(x, y, width, height, "input_output", text);
  }

  draw(svg) {
    const points = this.getParallelogramPoints();

    // Crear paralelogramo
    const parallelogram = document.createElementNS(this.namespace, 'polygon');
    parallelogram.setAttribute("points", points.map(p => p.join(',')).join(' '));
    parallelogram.setAttribute("fill", "#ffffff");
    parallelogram.setAttribute("stroke", "#3c3836");
    parallelogram.setAttribute("stroke-width", "2");
    parallelogram.setAttribute("class", "shape input-output");
    parallelogram.setAttribute("data-id", this.id);

    // Crear texto
    const textElement = document.createElementNS(this.namespace, 'text');
    textElement.setAttribute("x", this.x + this.width / 2);
    textElement.setAttribute("y", this.y + this.height / 2);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
    textElement.setAttribute("fill", "#3c3836");
    textElement.textContent = this.text;
    textElement.setAttribute("class", "shape-text");

    const group = document.createElementNS(this.namespace, 'g');
    group.appendChild(parallelogram);
    group.appendChild(textElement);
    svg.appendChild(group);

    this.element = group;
    return group;
  }

  getParallelogramPoints() {
    const skew = 15;

    return [
      [this.x + skew, this.y],
      [this.x + this.width, this.y],
      [this.x + this.width - skew, this.y + this.height],
      [this.x, this.y + this.height]
    ];
  }

  updateElementPosition() {
    if (!this.element) return;

    const parallelogram = this.element.querySelector('polygon');
    const text = this.element.querySelector('text');

    if (parallelogram) {
      const points = this.getParallelogramPoints();
      parallelogram.setAttribute("points", points.map(p => p.join(',')).join(' '));
    }

    if (text) {
      text.setAttribute("x", this.x + this.width / 2);
      text.setAttribute("y", this.y + this.height / 2);
    }
  }
}