export default class Connection {
  #source;
  #target;
  #element;
  #id;

  constructor(source, target) {
    this.#source = source;
    this.#target = target;
    this.#element = null;
    this.#id = this.generateId();
    this.namespace = "http://www.w3.org/2000/svg";
  }

  generateId() {
    return 'connection-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  get source() {
    return this.#source;
  }

  get target() {
    return this.#target;
  }

  get element() {
    return this.#element;
  }

  get id() {
    return this.#id;
  }

  set element(reference) {
    this.#element = reference;
  }

  draw(svg) {
    const line = document.createElementNS(this.namespace, 'line');
    const startPoint = this.#source.getConnectionPoints().bottom;
    const endPoint = this.#target.getConnectionPoints().top;

    line.setAttribute("x1", startPoint.x);
    line.setAttribute("y1", startPoint.y);
    line.setAttribute("x2", endPoint.x);
    line.setAttribute("y2", endPoint.y);
    line.setAttribute("stroke", "#3c3836");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("class", "connection");
    line.setAttribute("data-id", this.#id);
    line.setAttribute("marker-end", "url(#arrowhead)");

    svg.appendChild(line);
    this.#element = line;

    this.#source.addConnection(this);
    this.#target.addConnection(this);
  }

  update() {
    if (!this.#element) return;
    const startPoint = this.#source.getConnectionPoints().bottom;
    const endPoint = this.#target.getConnectionPoints().top;
    this.#element.setAttribute("x1", startPoint.x);
    this.#element.setAttribute("y1", startPoint.y);
    this.#element.setAttribute("x2", endPoint.x);
    this.#element.setAttribute("y2", endPoint.y);
  }

  remove() {
    if (this.#element) {
      this.#element.remove();
    }
    this.#source.removeConnection(this);
    this.#target.removeConnection(this);
  }

  toJSON() {
    return {
      id: this.#id,
      source: this.#source.id,
      target: this.#target.id
    };
  }
}
