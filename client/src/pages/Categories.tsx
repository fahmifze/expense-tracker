import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { Category } from '../types/category.types';
import { useToast, LoadingSection, Modal } from '../components/ui';

// Predefined colors for categories
const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#6B7280',
];

// Predefined icons
const ICONS = [
  'tag', 'utensils', 'car', 'file-text', 'film', 'shopping-bag',
  'heart', 'book', 'home', 'briefcase', 'gift', 'more-horizontal',
];

interface CategoryFormProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string; color: string }) => void;
  isLoading: boolean;
}

function CategoryForm({ category, isOpen, onClose, onSubmit, isLoading }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || 'tag');
  const [color, setColor] = useState(category?.color || '#6B7280');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, icon, color });
  };

  const resetForm = () => {
    setName(category?.name || '');
    setIcon(category?.icon || 'tag');
    setColor(category?.color || '#6B7280');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={category ? 'Edit Category' : 'New Category'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Category name"
            required
          />
        </div>

        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  icon === i
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-transparent'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Saving...' : category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const { showSuccess, showError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const defaultCategories = categories?.filter((c) => c.isDefault) || [];
  const customCategories = categories?.filter((c) => !c.isDefault) || [];

  const handleCreate = (data: { name: string; icon: string; color: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        showSuccess('Category created successfully');
      },
      onError: () => showError('Failed to create category'),
    });
  };

  const handleUpdate = (data: { name: string; icon: string; color: string }) => {
    if (!editingCategory) return;
    updateMutation.mutate(
      { id: editingCategory.id, data },
      {
        onSuccess: () => {
          setEditingCategory(undefined);
          showSuccess('Category updated successfully');
        },
        onError: () => showError('Failed to update category'),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSuccess('Category deleted'),
        onError: () => showError('Failed to delete category'),
      });
    }
  };

  if (isLoading) {
    return <LoadingSection />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Category
        </button>
      </div>

      {/* Default Categories */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {defaultCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: category.color }}
              >
                {category.icon.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Categories */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Categories ({customCategories.length})
        </h2>

        {customCategories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No custom categories yet. Click "Add Category" to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {customCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.icon}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      <CategoryForm
        isOpen={showForm || !!editingCategory}
        category={editingCategory}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(undefined);
        }}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
