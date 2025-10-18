export default class ToolbarManager {
  constructor(diagramManager) {
    this.diagramManager = diagramManager;
    this.activeTool = 'select';
    this.toolButtons = {};
    this.statusElement = document.getElementById('current-tool');

    this.init();
  }

  init() {
    this.setupToolButtons();
    this.setupEventListeners();
    this.updateStatus();
  }

  setupToolButtons() {
    // Mapear todos los botones de herramientas
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(button => {
      const tool = button.getAttribute('data-tool');
      this.toolButtons[tool] = button;
    });
  }

  setupEventListeners() {
    // Event listeners para los botones de herramientas
    Object.keys(this.toolButtons).forEach(tool => {
      this.toolButtons[tool].addEventListener('click', () => {
        this.setActiveTool(tool);
      });
    });

    // Event listener para teclas rápidas
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  setActiveTool(tool) {
    // Remover clase active de todos los botones
    Object.values(this.toolButtons).forEach(button => {
      button.classList.remove('active');
    });

    // Agregar clase active al botón seleccionado
    this.toolButtons[tool].classList.add('active');
    this.activeTool = tool;

    // Actualizar el modo del cursor en el SVG
    this.updateCursorMode();

    // Notificar al diagram manager
    this.diagramManager.setTool(tool);

    // Actualizar la barra de estado
    this.updateStatus();
  }

  updateCursorMode() {
    const svg = document.getElementById('svg-canvas');

    // Remover todas las clases de modo
    svg.classList.remove('select-mode', 'process-mode', 'decision-mode',
      'input_output-mode', 'connect-mode');

    // Agregar la clase correspondiente al modo actual
    svg.classList.add(`${this.activeTool}-mode`);
  }

  updateStatus() {
    const toolNames = {
      'select': 'Seleccionar',
      'process': 'Proceso',
      'decision': 'Decisión',
      'input_output': 'Entrada/Salida',
      'connect': 'Conectar',
      'delete': 'Eliminar',
      'save': 'Guardar',
      'load': 'Cargar',
      'export': 'Exportar'
    };

    this.statusElement.textContent = `Herramienta: ${toolNames[this.activeTool]}`;
  }

  handleKeyboardShortcuts(event) {
    // Solo procesar si no estamos en un campo de texto
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case '1':
        event.preventDefault();
        this.setActiveTool('select');
        break;
      case '2':
        event.preventDefault();
        this.setActiveTool('process');
        break;
      case '3':
        event.preventDefault();
        this.setActiveTool('decision');
        break;
      case '4':
        event.preventDefault();
        this.setActiveTool('input_output');
        break;
      case '5':
        event.preventDefault();
        this.setActiveTool('connect');
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        if (this.diagramManager.selectedShape) {
          this.diagramManager.deleteSelectedShape();
        }
        break;
      case 's':
      case 'S':
        if (event.ctrlKey) {
          event.preventDefault();
          this.setActiveTool('save');
          this.diagramManager.saveDiagram();
        }
        break;
    }
  }

  getActiveTool() {
    return this.activeTool;
  }
}
