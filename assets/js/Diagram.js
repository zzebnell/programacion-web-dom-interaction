class Diagram {
  #shapes;

  constructor() {
    this.#shapes = [];
  }

  addShape(shape) {
    this.#shapes.push(shape);
  }
}
