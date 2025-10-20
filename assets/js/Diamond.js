import Shape from './Shape.js';

export default class Diamond extends Shape {
  constructor(x, y, size = 80, text = "Decisión") {
    super(x, y, size, size, "decision", text);
  }

  draw(svg) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const diamond = document.createElementNS(this.namespace, 'polygon');
    const points = this.getDiamondPoints();
    diamond.setAttribute("points", points.map(p => p.join(',')).join(' '));
    diamond.setAttribute("fill", "#ffffff");
    diamond.setAttribute("stroke", "#3c3836");
    diamond.setAttribute("stroke-width", "2");
    diamond.setAttribute("class", "shape decision");
    diamond.setAttribute("data-id", this.id);

    const textElement = document.createElementNS(this.namespace, 'text');
    textElement.setAttribute("x", centerX);
    textElement.setAttribute("y", centerY);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
    textElement.setAttribute("fill", "#3c3836");
    textElement.textContent = this.text;
    textElement.setAttribute("class", "shape-text");

    const group = document.createElementNS(this.namespace, 'g');
    group.appendChild(diamond);
    group.appendChild(textElement);
    svg.appendChild(group);

    this.element = group;
    return group;
  }

  getDiamondPoints() {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    return [
      [centerX, this.y], // top
      [this.x + this.width, centerY], // right
      [centerX, this.y + this.height], // bottom
      [this.x, centerY] // left
    ];
  }

  updateElementPosition() {
    if (!this.element) return;

    const diamond = this.element.querySelector('polygon');
    const text = this.element.querySelector('text');
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    if (diamond) {
      const points = this.getDiamondPoints();
      diamond.setAttribute("points", points.map(p => p.join(',')).join(' '));
    }

    if (text) {
      text.setAttribute("x", centerX);
      text.setAttribute("y", centerY);
    }
  }
}
