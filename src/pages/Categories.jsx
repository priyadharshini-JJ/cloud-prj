import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledge } from '../context/KnowledgeContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  FolderPlus,
  Folder,
  Tag,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORY_COLORS = [
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'teal', label: 'Teal', bg: 'bg-teal-100 text-teal-800 border-teal-300' },
];

export default function Categories() {
  const {
    categories,
    items,
    tags,
    createCategory,
    editCategory,
    removeCategory,
    openCreateModal
  } = useKnowledge();
  const toast = useToast();
  const navigate = useNavigate();

  // Category Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('emerald');

  // Delete Confirm State
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open Create Category
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('emerald');
    setModalOpen(true);
  };

  // Open Edit Category
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || 'emerald');
    setModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          color,
        });
        toast.success(`Category "${name}" updated`);
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
          color,
        });
        toast.success(`Category "${name}" created`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save category: ' + err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await removeCategory(categoryToDelete.id);
      toast.success('Category removed');
      setCategoryToDelete(null);
    } catch (err) {
      toast.error('Failed to remove category: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate items count per category
  const getCategoryCount = (catId, catName) => {
    return items.filter(
      i => i.categoryId === catId || (i.categoryName && i.categoryName.toLowerCase() === catName.toLowerCase())
    ).length;
  };

  // Tag frequency
  const tagCounts = tags.map(tag => {
    const count = items.filter(i => Array.isArray(i.tags) && i.tags.includes(tag)).length;
    return { tag, count };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Categories & Tags Taxonomy
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize knowledge into structured domains and browse by multi-dimensional tags.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Knowledge Categories ({categories.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id, cat.name);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Folder className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'General domain collection for organizing related records.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`/library?category=${encodeURIComponent(cat.id)}`)}
                    className="font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags Cloud Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Tag Cloud ({tags.length} unique tags)</span>
          </h2>
          <span className="text-xs text-slate-400">Click any tag to filter library</span>
        </div>

        {tags.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No tags created yet. Add tags when saving knowledge to quickly group related items.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tagCounts.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/library?q=${encodeURIComponent(tag)}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/70 hover:border-emerald-300 transition-all"
              >
                <span>#{tag}</span>
                <span className="bg-white text-slate-500 text-[10px] px-1.5 py-0.2 rounded-full font-semibold shadow-2xs">
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & Machine Learning, Architecture, Health"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what belongs in this category..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex gap-2">
              {CATEGORY_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c.id ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2' : 'opacity-80'
                  } ${c.bg}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Items assigned to this category will not be deleted.`}
        confirmText="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
}
