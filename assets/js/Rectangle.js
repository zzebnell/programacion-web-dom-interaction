import Shape from './Shape.js';

export default class Rectangle extends Shape {
  constructor(x, y, width = 120, height = 60, text = "Proceso") {
    super(x, y, width, height, "process", text);
  }

  draw(svg) {
    // Crear rectángulo
    const rect = document.createElementNS(this.namespace, 'rect');
    rect.setAttribute("x", this.x);
    rect.setAttribute("y", this.y);
    rect.setAttribute("width", this.width);
    rect.setAttribute("height", this.height);
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#3c3836");
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("rx", "5");
    rect.setAttribute("class", "shape process");
    rect.setAttribute("data-id", this.id);

    // Crear texto
    const textElement = document.createElementNS(this.namespace, 'text');
    textElement.setAttribute("x", this.x + this.width / 2);
    textElement.setAttribute("y", this.y + this.height / 2);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
    textElement.setAttribute("fill", "#3c3836");
    textElement.textContent = this.text;
    textElement.setAttribute("class", "shape-text");

    // Agregar al SVG
    const group = document.createElementNS(this.namespace, 'g');
    group.appendChild(rect);
    group.appendChild(textElement);
    svg.appendChild(group);

    this.element = group;
    return group;
  }

  updateElementPosition() {
    if (!this.element) return;

    const rect = this.element.querySelector('rect');
    const text = this.element.querySelector('text');

    if (rect) {
      rect.setAttribute("x", this.x);
      rect.setAttribute("y", this.y);
    }

    if (text) {
      text.setAttribute("x", this.x + this.width / 2);
      text.setAttribute("y", this.y + this.height / 2);
    }
  }
}