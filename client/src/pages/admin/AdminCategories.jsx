import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Layers
} from 'lucide-react';

export const AdminCategories = () => {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit'
  const [activeCategory, setActiveCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.categories.getAll();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setIcon('Folder');
    setActiveCategory(null);
    setModalMode('create');
  };

  const handleOpenEdit = (cat) => {
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Folder');
    setActiveCategory(cat);
    setModalMode('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        const res = await api.categories.create({ name: name.trim(), description: description.trim(), icon });
        if (res.success) {
          toast.success(`Category "${res.data.name}" created.`);
          setModalMode(null);
          loadCategories();
        }
      } else {
        const res = await api.categories.update(activeCategory.id, { name: name.trim(), description: description.trim(), icon });
        if (res.success) {
          toast.success(`Category updated.`);
          setModalMode(null);
          loadCategories();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.categories.delete(deleteTarget.id);
      if (res.success) {
        toast.success(`Category "${deleteTarget.name}" deleted.`);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
              <FolderOpen size={22} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Category Management
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Structure content classification and media filtering taxonomies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="glow-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {loading ? (
          <div>Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FolderOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      slug: {cat.slug}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    style={{ padding: '6px', borderRadius: '4px', color: 'var(--text-secondary)' }}
                    title="Edit category"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    style={{ padding: '6px', borderRadius: '4px', color: '#ef4444' }}
                    title="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {cat.description || 'No description added.'}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Layers size={13} />
                <span>{cat.mediaCount || 0} associated media files</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <Modal
          isOpen={Boolean(modalMode)}
          onClose={() => setModalMode(null)}
          title={modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
          maxWidth="440px"
        >
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Podcasts & Interviews"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Brief summary of media in this category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Icon Style</label>
              <select
                className="form-input"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="Folder">Folder</option>
                <option value="Film">Film</option>
                <option value="Music">Music</option>
                <option value="Image">Image</option>
                <option value="FileText">FileText</option>
                <option value="Cpu">Cpu / Technology</option>
                <option value="Compass">Compass / Exploration</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setModalMode(null)}
                style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glow-btn"
                disabled={isSubmitting || !name.trim()}
                style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 500 }}
              >
                {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Category' : 'Update Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          message={`Are you sure you want to delete category "${deleteTarget.name}"? Media in this category will become unassigned.`}
          confirmText="Delete Category"
        />
      )}
    </div>
  );
};
