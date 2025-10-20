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

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get text() {
    return this.#text;
  }

  get type() {
    return this.#type;
  }

  get id() {
    return this.#id;
  }

  get element() {
    return this.#element;
  }

  get connections() {
    return this.#connections;
  }

  get isSelected() {
    return this.#isSelected;
  }

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

  startEditing() {
    if (!this.element) return;

    const textElement = this.element.querySelector('.shape-text');
    if (!textElement) return;

    textElement.style.visibility = 'hidden';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.text;
    input.className = 'shape-text-editor';
    input.style.position = 'absolute';
    input.style.left = `${this.x + 10}px`;
    input.style.top = `${this.y + 10}px`;
    input.style.width = `${this.width - 20}px`;
    input.style.height = `${this.height - 20}px`;
    input.style.border = '2px solid #458588';
    input.style.background = 'white';
    input.style.borderRadius = '3px';
    input.style.padding = '5px';
    input.style.fontSize = '14px';
    input.style.fontFamily = 'inherit';
    input.style.textAlign = 'center';
    input.style.zIndex = '1000';

    document.body.appendChild(input);
    input.focus();
    input.select();

    const handleConfirm = () => {
      this.text = input.value.trim() || this.text; // Mantener texto anterior si está vacío
      input.remove();
      textElement.style.visibility = 'visible';
    };

    const handleCancel = () => {
      input.remove();
      textElement.style.visibility = 'visible';
    };

    input.addEventListener('blur', handleConfirm);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    });

    this._textInput = input;
  }

  cancelEditing() {
    if (this._textInput) {
      this._textInput.remove();
      this._textInput = null;

      const textElement = this.element.querySelector('.shape-text');
      if (textElement) {
        textElement.style.visibility = 'visible';
      }
    }
  }


  addConnection(connection) {
    this.#connections.push(connection);
  }

  removeConnection(connection) {
    const index = this.#connections.indexOf(connection);
    if (index > -1) {
      this.#connections.splice(index, 1);
    }
  }

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

  getCenter() {
    return {
      x: this.#x + this.#width / 2,
      y: this.#y + this.#height / 2
    };
  }

  containsPoint(x, y) {
    return x >= this.#x &&
      x <= this.#x + this.#width &&
      y >= this.#y &&
      y <= this.#y + this.#height;
  }

  updateElementPosition() {
    if (!this.#element) return;
  }

  updateElementText() {
    if (!this.#element) return;

    const textElement = this.#element.querySelector('.shape-text');
    if (textElement) {
      textElement.textContent = this.#text;
    }
  }

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

  draw(svg) {
    throw new Error("Método draw debe ser implementado por la subclase");
  }

  updatePosition(newX, newY) {
    this.#x = newX;
    this.#y = newY;
    this.updateElementPosition();
  }

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
