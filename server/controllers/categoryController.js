import db from '../config/db.js';

export const getCategories = (req, res, next) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(m.id) as mediaCount
      FROM categories c
      LEFT JOIN media m ON m.categoryId = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = (req, res, next) => {
  try {
    const category = db.prepare(`
      SELECT c.*, COUNT(m.id) as mediaCount
      FROM categories c
      LEFT JOIN media m ON m.categoryId = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ? OR LOWER(name) = LOWER(?)').get(slug, name.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    const insert = db.prepare(`
      INSERT INTO categories (name, slug, description, icon)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(name.trim(), slug, description || '', icon || 'Folder');
    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(result.lastInsertRowid));

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const duplicate = db.prepare('SELECT id FROM categories WHERE (slug = ? OR LOWER(name) = LOWER(?)) AND id != ?').get(slug, name.trim(), id);
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another category with this name already exists.' });
      }
    }

    db.prepare(`
      UPDATE categories
      SET name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          description = COALESCE(?, description),
          icon = COALESCE(?, icon)
      WHERE id = ?
    `).run(name ? name.trim() : null, slug, description !== undefined ? description : null, icon || null, id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
