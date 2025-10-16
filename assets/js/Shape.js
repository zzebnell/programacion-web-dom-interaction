export default class Shape {
  #x;
  #y;
  #element;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
    this.#element = null;
    this.namespace = "http://www.w3.org/2000/svg";
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  set element(reference) {
    this.#element = reference;
  }

}
