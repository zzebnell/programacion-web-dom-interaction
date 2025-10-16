export default class Shape {
  #x;
  #y;
  #element;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
    this.#element = null;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get element() {
    return this.#element;
  }

}
