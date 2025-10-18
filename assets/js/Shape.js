export default class Shape {
  #x;
  #y;
  #width;
  #height;
  #text;
  #type;
  #id;
  #element;
  #connections;
  #isSelected;

  constructor(x, y, width, height, type, text = "") {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    this.#type = type;
    this.#text = text;
    this.#id = this.generateId();
    this.#element = null;
    this.#connections = [];
    this.#isSelected = false;
    this.namespace = "http://www.w3.org/2000/svg";
  }

  generateId() {
    return 'shape-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  // Getters
  get x() { return this.#x; }
  get y() { return this.#y; }
  get width() { return this.#width; }
  get height() { return this.#height; }
  get text() { return this.#text; }
  get type() { return this.#type; }
  get id() { return this.#id; }
  get element() { return this.#element; }
  get connections() { return this.#connections; }
  get isSelected() { return this.#isSelected; }

  // Setters
  set x(value) {
    this.#x = value;
    this.updateElementPosition();
  }
  set y(value) {
    this.#y = value;
    this.updateElementPosition();
  }
  set text(value) {
    this.#text = value;
    this.updateElementText();
  }
  set element(reference) {
    this.#element = reference;
  }
  set isSelected(value) {
    this.#isSelected = value;
    this.updateSelectionStyle();
  }
  set id(value) {
    this.#id = value;
  }


  // Métodos para conexiones
  addConnection(connection) {
    this.#connections.push(connection);
  }

  removeConnection(connection) {
    const index = this.#connections.indexOf(connection);
    if (index > -1) {
      this.#connections.splice(index, 1);
    }
  }

  // Método para obtener puntos de conexión
  getConnectionPoints() {
    const centerX = this.#x + this.#width / 2;
    const centerY = this.#y + this.#height / 2;

    return {
      top: { x: centerX, y: this.#y },
      right: { x: this.#x + this.#width, y: centerY },
      bottom: { x: centerX, y: this.#y + this.#height },
      left: { x: this.#x, y: centerY }
    };
  }

  // Método para obtener el centro de la forma
  getCenter() {
    return {
      x: this.#x + this.#width / 2,
      y: this.#y + this.#height / 2
    };
  }

  // Método para verificar si un punto está dentro de la forma
  containsPoint(x, y) {
    return x >= this.#x &&
      x <= this.#x + this.#width &&
      y >= this.#y &&
      y <= this.#y + this.#height;
  }

  // Método para actualizar posición visual
  updateElementPosition() {
    if (!this.#element) return;

    // Esta implementación depende de la forma específica
    // Se implementará en las subclases
  }

  // Método para actualizar texto visual
  updateElementText() {
    if (!this.#element) return;

    const textElement = this.#element.querySelector('.shape-text');
    if (textElement) {
      textElement.textContent = this.#text;
    }
  }

  // Método para actualizar estilo de selección
  updateSelectionStyle() {
    if (!this.#element) return;

    const shapeElement = this.#element.querySelector('.shape');
    if (shapeElement) {
      if (this.#isSelected) {
        shapeElement.classList.add('selected');
        shapeElement.setAttribute('stroke', '#458588');
        shapeElement.setAttribute('stroke-width', '3');
      } else {
        shapeElement.classList.remove('selected');
        shapeElement.setAttribute('stroke', '#3c3836');
        shapeElement.setAttribute('stroke-width', '2');
      }
    }
  }

  // Método para dibujar (debe ser implementado por las subclases)
  draw(svg) {
    throw new Error("Método draw debe ser implementado por la subclase");
  }

  // Método para actualizar posición
  updatePosition(newX, newY) {
    this.#x = newX;
    this.#y = newY;
    this.updateElementPosition();
  }

  // Método para serializar la forma
  toJSON() {
    return {
      id: this.#id,
      type: this.#type,
      x: this.#x,
      y: this.#y,
      width: this.#width,
      height: this.#height,
      text: this.#text
    };
  }
}