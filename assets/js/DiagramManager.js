import Rectangle from './Rectangle.js';
import Diamond from './Diamond.js';
import Parallelogram from './Parallelogram.js';
import Connection from './Connection.js';
import PouchDBManager from './PouchDBManager.js';

export default class DiagramManager {
  constructor(svgElement) {
    this.svg = svgElement;
    this.shapes = [];
    this.connections = [];
    this.selectedTool = 'select';
    this.selectedShape = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.shapeStartX = 0;
    this.shapeStartY = 0;

    this.connectionStartShape = null;
    this.tempConnectionLine = null;

    this.dbManager = new PouchDBManager();

    this.initEventListeners();
    this.initSVGMarkers();

    this.loadDiagram();
  }

  importDiagram() {
    console.log('Importando diagrama...');

    const fileInput = document.getElementById('file-input-diagram');

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);

          if (!jsonData.shapes || !jsonData.connections) {
            throw new Error('Formato de archivo inválido');
          }

          this.loadFromJSON(jsonData);
          console.log('Diagrama importado correctamente');
          this.showSimpleMessage('Diagrama importado');

          fileInput.value = '';
        } catch (error) {
          console.error('Error al importar diagrama:', error);
          this.showSimpleMessage('Error: archivo inválido');
        }
      };

      reader.onerror = () => {
        console.error('Error al leer el archivo');
        this.showSimpleMessage('Error al leer archivo');
      };

      reader.readAsText(file);
    };

    fileInput.click();
  }

  initSVGMarkers() {
    const defs = document.createElementNS(this.svg.namespaceURI, 'defs');
    const marker = document.createElementNS(this.svg.namespaceURI, 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS(this.svg.namespaceURI, 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#3c3836');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
  }

  initEventListeners() {
    this.svg.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });

    this.svg.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e);
    });

    this.svg.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    this.svg.addEventListener('mouseup', (e) => {
      this.handleMouseUp(e);
    });

    this.svg.addEventListener('mouseleave', (e) => {
      this.handleMouseLeave(e);
    });

    this.svg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.svg.addEventListener('dblclick', (e) => {
      this.handleDoubleClick(e);
    });

    this.svg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.addEventListener('click', (e) => {
      this.handleOutsideClick(e);
    });
  }

  addProcess(x, y, text = "Proceso") {
    const process = new Rectangle(x, y, 120, 60, text);
    this.shapes.push(process);
    process.draw(this.svg);
    return process;
  }

  addDecision(x, y, text = "Decisión") {
    const decision = new Diamond(x, y, 80, text);
    this.shapes.push(decision);
    decision.draw(this.svg);
    return decision;
  }

  addInputOutput(x, y, text = "Entrada/Salida") {
    const io = new Parallelogram(x, y, 120, 60, text);
    this.shapes.push(io);
    io.draw(this.svg);
    return io;
  }

  setTool(tool) {
    this.selectedTool = tool;

    if (tool !== 'connect' && this.connectionStartShape) {
      this.connectionStartShape = null;
      this.removeTempConnection();
    }

    if (tool !== 'select' && this.selectedShape) {
      this.deselectShape();
    }
  }

  handleCanvasClick(e) {
    const rect = this.svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    switch (this.selectedTool) {
      case 'process':
        this.addProcess(x - 60, y - 30);
        break;
      case 'decision':
        this.addDecision(x - 40, y - 40);
        break;
      case 'input_output':
        this.addInputOutput(x - 60, y - 30);
        break;
      case 'select':
        break;
      case 'delete':
        this.deleteShapeAt(x, y);
        break;
      case 'connect':
        this.handleConnectClick(x, y);
        break;
    }
  }

  handleConnectClick(x, y) {
    const shape = this.findShapeAt(x, y);

    if (!shape) {
      this.connectionStartShape = null;
      this.removeTempConnection();
      return;
    }

    if (!this.connectionStartShape) {
      this.connectionStartShape = shape;
      shape.isSelected = true;
    } else {
      if (this.connectionStartShape !== shape) {
        const connection = new Connection(this.connectionStartShape, shape);
        this.connections.push(connection);
        connection.draw(this.svg);
      }

      this.connectionStartShape.isSelected = false;
      this.connectionStartShape = null;
      this.removeTempConnection();
    }
  }

  handleMouseDown(e) {
    const rect = this.svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.selectedTool === 'select') {
      const shape = this.findShapeAt(x, y);

      if (shape) {
        this.selectShape(shape);
        this.startDragging(x, y);
      } else {
        this.deselectShape();
      }
    }
  }

  handleMouseMove(e) {
    const rect = this.svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.selectedTool === 'connect' && this.connectionStartShape) {
      this.updateTempConnection(x, y);
    }

    if (this.isDragging && this.selectedShape) {
      const deltaX = x - this.dragStartX;
      const deltaY = y - this.dragStartY;

      this.selectedShape.updatePosition(
        this.shapeStartX + deltaX,
        this.shapeStartY + deltaY
      );

      this.updateShapeConnections(this.selectedShape);
    }
  }

  handleMouseUp(e) {
    this.stopDragging();
  }

  handleMouseLeave(e) {
    this.stopDragging();
  }

  handleDoubleClick(e) {
    if (this.selectedTool !== 'select') return;

    const rect = this.svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shape = this.findShapeAt(x, y);

    if (shape) {
      e.stopPropagation();
      shape.startEditing();
    }
  }

  handleOutsideClick(e) {
    if (!e.target.classList.contains('shape-text-editor')) {
      this.shapes.forEach(shape => {
        if (shape.cancelEditing) {
          shape.cancelEditing();
        }
      });
    }
  }

  updateTempConnection(x, y) {
    if (!this.connectionStartShape) return;

    const startPoint = this.connectionStartShape.getConnectionPoints().bottom;

    if (!this.tempConnectionLine) {
      this.tempConnectionLine = document.createElementNS(this.svg.namespaceURI, 'line');
      this.tempConnectionLine.setAttribute("stroke", "#458588");
      this.tempConnectionLine.setAttribute("stroke-width", "2");
      this.tempConnectionLine.setAttribute("stroke-dasharray", "5,5");
      this.tempConnectionLine.setAttribute("class", "temp-connection");
      this.svg.appendChild(this.tempConnectionLine);
    }

    this.tempConnectionLine.setAttribute("x1", startPoint.x);
    this.tempConnectionLine.setAttribute("y1", startPoint.y);
    this.tempConnectionLine.setAttribute("x2", x);
    this.tempConnectionLine.setAttribute("y2", y);
  }

  removeTempConnection() {
    if (this.tempConnectionLine) {
      this.tempConnectionLine.remove();
      this.tempConnectionLine = null;
    }
  }

  startDragging(x, y) {
    this.isDragging = true;
    this.dragStartX = x;
    this.dragStartY = y;
    this.shapeStartX = this.selectedShape.x;
    this.shapeStartY = this.selectedShape.y;
  }

  stopDragging() {
    this.isDragging = false;
  }

  findShapeAt(x, y) {
    return this.shapes.find(shape => shape.containsPoint(x, y));
  }

  findShapeById(id) {
    return this.shapes.find(shape => shape.id === id);
  }

  selectShape(shape) {
    if (this.selectedShape) {
      this.deselectShape();
    }

    this.selectedShape = shape;
    shape.isSelected = true;
  }

  deselectShape() {
    if (this.selectedShape) {
      this.selectedShape.isSelected = false;
      this.selectedShape = null;
    }
  }

  deleteShapeAt(x, y) {
    const shape = this.findShapeAt(x, y);
    if (shape) {
      this.deleteShape(shape);
    }
  }

  deleteShape(shape) {
    const connectionsToRemove = [...shape.connections];
    connectionsToRemove.forEach(connection => {
      this.deleteConnection(connection);
    });

    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
    }

    if (shape.element) {
      shape.element.remove();
    }

    if (this.selectedShape === shape) {
      this.selectedShape = null;
    }
  }

  deleteConnection(connection) {
    const index = this.connections.indexOf(connection);
    if (index > -1) {
      this.connections.splice(index, 1);
    }

    connection.remove();
  }

  deleteSelectedShape() {
    if (this.selectedShape) {
      this.deleteShape(this.selectedShape);
    }
  }

  updateShapeConnections(shape) {
    shape.connections.forEach(connection => {
      connection.update();
    });
  }

  toJSON() {
    return {
      shapes: this.shapes.map(shape => shape.toJSON()),
      connections: this.connections.map(connection => connection.toJSON())
    };
  }

  async saveDiagram() {
    try {
      const data = this.toJSON();
      await this.dbManager.saveDiagram(data);
      console.log('Diagrama guardado en PouchDB');
      this.showSimpleMessage('Diagrama guardado');
    } catch (error) {
      console.error('Error al guardar diagrama:', error);
      this.showSimpleMessage('Error al guardar');
    }
  }

  async loadDiagram() {
    try {
      const diagramData = await this.dbManager.loadDiagram();
      if (diagramData) {
        this.loadFromJSON(diagramData);
        console.log('Diagrama cargado desde PouchDB');
        this.showSimpleMessage('Diagrama cargado');
      }
    } catch (error) {
      console.error('Error al cargar diagrama:', error);
    }
  }

  loadFromJSON(data) {
    this.shapes.forEach(shape => {
      if (shape.element) shape.element.remove();
    });
    this.connections.forEach(connection => {
      if (connection.element) connection.element.remove();
    });

    this.shapes = [];
    this.connections = [];
    this.selectedShape = null;

    data.shapes.forEach(shapeData => {
      let shape;
      switch (shapeData.type) {
        case 'process':
          shape = new Rectangle(shapeData.x, shapeData.y, shapeData.width, shapeData.height, shapeData.text);
          break;
        case 'decision':
          shape = new Diamond(shapeData.x, shapeData.y, shapeData.width, shapeData.text);
          break;
        case 'input_output':
          shape = new Parallelogram(shapeData.x, shapeData.y, shapeData.width, shapeData.height, shapeData.text);
          break;
      }

      if (shape) {
        shape.id = shapeData.id;
        this.shapes.push(shape);
        shape.draw(this.svg);
      }
    });

    data.connections.forEach(connData => {
      const source = this.findShapeById(connData.source);
      const target = this.findShapeById(connData.target);

      if (source && target) {
        const connection = new Connection(source, target);
        this.connections.push(connection);
        connection.draw(this.svg);
      }
    });
  }

  exportDiagram() {
    console.log('Exportando diagrama...');
    const data = this.toJSON();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'diagrama-flujo.json';
    link.click();

    console.log('Diagrama exportado como JSON');
  }

  showSimpleMessage(message) {
    console.log(message);
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #98971a;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 1000;
    font-size: 14px;
    `;
    document.body.appendChild(msg);
    setTimeout(() => {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    }, 2000);
  }
}
