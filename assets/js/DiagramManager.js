import Rectangle from './Rectangle.js';
import Diamond from './Diamond.js';
import Parallelogram from './Parallelogram.js';
import Connection from './Connection.js';

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

    // Para el modo de conexión
    this.connectionStartShape = null;
    this.tempConnectionLine = null;

    this.initEventListeners();
    this.initSVGMarkers();
  }

  initSVGMarkers() {
    // Definir el marcador de flecha para las conexiones
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

    // Prevenir el menú contextual
    this.svg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // Métodos para agregar formas
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

  // Método para seleccionar herramienta
  setTool(tool) {
    this.selectedTool = tool;

    // Limpiar estado de conexión temporal
    if (tool !== 'connect' && this.connectionStartShape) {
      this.connectionStartShape = null;
      this.removeTempConnection();
    }

    // Si cambiamos de herramienta, deseleccionar la forma actual
    if (tool !== 'select' && this.selectedShape) {
      this.deselectShape();
    }
  }

  // Método para manejar clics en el canvas
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
        // La selección se maneja en handleMouseDown/Up
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
      // Clic fuera de forma - cancelar conexión
      this.connectionStartShape = null;
      this.removeTempConnection();
      return;
    }

    if (!this.connectionStartShape) {
      // Primera forma seleccionada - inicio de conexión
      this.connectionStartShape = shape;
      shape.isSelected = true;
    } else {
      // Segunda forma seleccionada - crear conexión
      if (this.connectionStartShape !== shape) {
        const connection = new Connection(this.connectionStartShape, shape);
        this.connections.push(connection);
        connection.draw(this.svg);
      }

      // Limpiar estado de conexión
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

    // Actualizar conexión temporal en modo connect
    if (this.selectedTool === 'connect' && this.connectionStartShape) {
      this.updateTempConnection(x, y);
    }

    // Manejar arrastre de formas
    if (this.isDragging && this.selectedShape) {
      const deltaX = x - this.dragStartX;
      const deltaY = y - this.dragStartY;

      this.selectedShape.updatePosition(
        this.shapeStartX + deltaX,
        this.shapeStartY + deltaY
      );

      // Actualizar todas las conexiones de esta forma
      this.updateShapeConnections(this.selectedShape);
    }
  }

  handleMouseUp(e) {
    this.stopDragging();
  }

  handleMouseLeave(e) {
    this.stopDragging();
  }

  updateTempConnection(x, y) {
    if (!this.connectionStartShape) return;

    const startPoint = this.connectionStartShape.getConnectionPoints().bottom;

    if (!this.tempConnectionLine) {
      // Crear línea temporal
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

  // Método para encontrar forma por coordenadas
  findShapeAt(x, y) {
    return this.shapes.find(shape => shape.containsPoint(x, y));
  }

  // Método para encontrar forma por ID
  findShapeById(id) {
    return this.shapes.find(shape => shape.id === id);
  }

  selectShape(shape) {
    // Deseleccionar forma anterior
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
    // Eliminar todas las conexiones de esta forma
    const connectionsToRemove = [...shape.connections];
    connectionsToRemove.forEach(connection => {
      this.deleteConnection(connection);
    });

    // Remover del array
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
    }

    // Remover del DOM
    if (shape.element) {
      shape.element.remove();
    }

    // Si era la forma seleccionada, deseleccionar
    if (this.selectedShape === shape) {
      this.selectedShape = null;
    }
  }

  deleteConnection(connection) {
    // Remover del array
    const index = this.connections.indexOf(connection);
    if (index > -1) {
      this.connections.splice(index, 1);
    }

    // Remover del DOM y limpiar referencias
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

  // Método para serializar el diagrama completo
  toJSON() {
    return {
      shapes: this.shapes.map(shape => shape.toJSON()),
      connections: this.connections.map(connection => connection.toJSON())
    };
  }

  // Métodos para guardar/cargar
  saveDiagram() {
    console.log('Guardando diagrama...');
    const data = this.toJSON();
    localStorage.setItem('flowchart-data', JSON.stringify(data));
    console.log('Diagrama guardado en localStorage');
  }

  loadDiagram() {
    console.log('Cargando diagrama...');
    const data = localStorage.getItem('flowchart-data');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        this.loadFromJSON(parsedData);
        console.log('Diagrama cargado desde localStorage');
      } catch (error) {
        console.error('Error al cargar el diagrama:', error);
      }
    } else {
      console.log('No hay datos guardados');
    }
  }

  loadFromJSON(data) {
    // Limpiar diagrama actual
    this.shapes.forEach(shape => {
      if (shape.element) shape.element.remove();
    });
    this.connections.forEach(connection => {
      if (connection.element) connection.element.remove();
    });

    this.shapes = [];
    this.connections = [];
    this.selectedShape = null;

    // Cargar formas
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
        // Restaurar ID original
        shape.id = shapeData.id;
        this.shapes.push(shape);
        shape.draw(this.svg);
      }
    });

    // Cargar conexiones
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

    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'diagrama-flujo.json';
    link.click();

    console.log('Diagrama exportado como JSON');
  }
}