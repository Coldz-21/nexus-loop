const db = require('../database/config');

// Create document_templates table
db.prepare(`
  CREATE TABLE IF NOT EXISTS document_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    fields_mapped BOOLEAN DEFAULT 0,
    field_mappings TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  )
`).run();

console.log('Document templates table initialized');

module.exports = {
  // Create a new document template
  create: (templateData) => {
    const stmt = db.prepare(`
      INSERT INTO document_templates (
        name, description, category, file_path, file_name, 
        file_type, file_size, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      templateData.name,
      templateData.description,
      templateData.category,
      templateData.file_path,
      templateData.file_name,
      templateData.file_type,
      templateData.file_size,
      templateData.created_by
    );
  },

  // Get all document templates
  getAll: () => {
    return db.prepare(`
      SELECT dt.*, u.name as created_by_name 
      FROM document_templates dt
      LEFT JOIN users u ON dt.created_by = u.id
      ORDER BY dt.created_at DESC
    `).all();
  },

  // Get template by ID
  getById: (id) => {
    return db.prepare(`
      SELECT dt.*, u.name as created_by_name 
      FROM document_templates dt
      LEFT JOIN users u ON dt.created_by = u.id
      WHERE dt.id = ?
    `).get(id);
  },

  // Get templates by category
  getByCategory: (category) => {
    return db.prepare(`
      SELECT dt.*, u.name as created_by_name 
      FROM document_templates dt
      LEFT JOIN users u ON dt.created_by = u.id
      WHERE dt.category = ?
      ORDER BY dt.created_at DESC
    `).all(category);
  },

  // Update field mappings for a template
  updateFieldMappings: (id, fieldMappings) => {
    const stmt = db.prepare(`
      UPDATE document_templates SET
        field_mappings = ?,
        fields_mapped = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(JSON.stringify(fieldMappings), id);
  },

  // Delete a template
  delete: (id) => {
    return db.prepare('DELETE FROM document_templates WHERE id = ?').run(id);
  },

  // Update template info
  update: (id, data) => {
    const stmt = db.prepare(`
      UPDATE document_templates SET
        name = ?,
        description = ?,
        category = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(data.name, data.description, data.category, id);
  },

  // Get template statistics
  getStats: () => {
    return db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN fields_mapped = 1 THEN 1 END) as mapped,
        COUNT(CASE WHEN category = 'contract' THEN 1 END) as contracts,
        COUNT(CASE WHEN category = 'listing' THEN 1 END) as listings
      FROM document_templates
    `).get();
  }
};
