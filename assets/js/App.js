import DiagramManager from './DiagramManager.js';
import ToolbarManager from './ToolbarManager.js';

const svg = document.getElementById("svg-canvas");
const diagramManager = new DiagramManager(svg);
const toolbarManager = new ToolbarManager(diagramManager);

document.getElementById('btn-save').addEventListener('click', () => {
  diagramManager.saveDiagram();
});

document.getElementById('btn-load').addEventListener('click', () => {
  diagramManager.loadDiagram();
});

document.getElementById('btn-export').addEventListener('click', () => {
  diagramManager.exportDiagram();
});

document.getElementById('btn-import').addEventListener('click', () => {
  diagramManager.importDiagram();
});

console.log("Diagram Editor inicializado correctamente");
