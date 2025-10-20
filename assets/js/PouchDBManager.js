// PouchDBManager.js
export default class PouchDBManager {
  constructor() {
    this.db = new PouchDB('flowchart-diagrams');
  }

  async saveDiagram(diagramData) {
    try {
      const doc = {
        _id: 'current-diagram',
        data: diagramData,
        savedAt: new Date().toISOString()
      };

      try {
        const existing = await this.db.get('current-diagram');
        doc._rev = existing._rev;
      } catch (e) {
      }

      const result = await this.db.put(doc);
      console.log('Diagrama guardado en PouchDB');
      return result;
    } catch (error) {
      console.error('Error al guardar diagrama:', error);
      throw error;
    }
  }

  async loadDiagram() {
    try {
      const doc = await this.db.get('current-diagram');
      return doc.data;
    } catch (error) {
      console.log('No hay diagrama guardado aún');
      return null;
    }
  }
}
