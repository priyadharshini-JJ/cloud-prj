import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useKnowledge } from '../../context/KnowledgeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { SOURCE_TYPES } from '../../lib/defaultCategories';
import { uploadAttachment, validateAttachment, formatBytes } from '../../lib/storageService';
import { Upload, X, Paperclip, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function KnowledgeModal() {
  const { modalState, closeModal, createItem, editItem, categories } = useKnowledge();
  const { user } = useAuth();
  const toast = useToast();

  const isEditing = Boolean(modalState.itemToEdit);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState('Website');
  const [categoryId, setCategoryId] = useState('development');
  const [tagsInput, setTagsInput] = useState('');
  const [tagsList, setTagsList] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Attachment State
  const [attachment, setAttachment] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Populate form on open
  useEffect(() => {
    if (modalState.isOpen) {
      if (modalState.itemToEdit) {
        const item = modalState.itemToEdit;
        setTitle(item.title || '');
        setDescription(item.description || '');
        setSourceUrl(item.sourceUrl || '');
        setSourceType(item.sourceType || 'Website');
        setCategoryId(item.categoryId || (categories[0]?.id || 'development'));
        setTagsList(Array.isArray(item.tags) ? [...item.tags] : []);
        setIsFavorite(Boolean(item.isFavorite));
        setAttachment(item.attachment || null);
      } else {
        // Reset form for fresh creation
        setTitle('');
        setDescription('');
        setSourceUrl('');
        setSourceType('Website');
        setCategoryId(modalState.defaultCategoryId || (categories[0]?.id || 'development'));
        setTagsList([]);
        setIsFavorite(false);
        setAttachment(null);
      }
      setNewFile(null);
      setUploadProgress(0);
      setFileError(null);
      setSubmitError(null);
    }
  }, [modalState.isOpen, modalState.itemToEdit, modalState.defaultCategoryId, categories]);

  // Handle Tag Input
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagsInput.trim().replace(/^#/, '').toLowerCase();
      if (val && !tagsList.includes(val)) {
        setTagsList([...tagsList, val]);
        setTagsInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAttachment(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setNewFile(null);
      return;
    }

    setFileError(null);
    setNewFile(file);
  };

  const handleRemoveExistingAttachment = () => {
    setAttachment(null);
    setNewFile(null);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError('Title is required');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      let finalAttachment = attachment;

      // Upload file if new one was chosen
      if (newFile && user?.uid) {
        setIsUploading(true);
        setUploadProgress(10);
        finalAttachment = await uploadAttachment(user.uid, newFile, (pct) => {
          setUploadProgress(pct);
        });
        setIsUploading(false);
      }

      // Find category name
      const matchedCategory = categories.find(c => c.id === categoryId);
      const categoryName = matchedCategory ? matchedCategory.name : 'General';

      const payload = {
        title: title.trim(),
        description: description.trim(),
        sourceUrl: sourceUrl.trim(),
        sourceType,
        categoryId,
        categoryName,
        tags: tagsList,
        isFavorite,
        attachment: finalAttachment,
      };

      if (isEditing) {
        await editItem(modalState.itemToEdit.id, payload);
        toast.success('Knowledge item updated');
      } else {
        await createItem(payload);
        toast.success('Knowledge captured successfully!');
      }

      closeModal();
    } catch (err) {
      console.error('Save error:', err);
      setSubmitError(err.message || 'Failed to save item. Your form input has been preserved.');
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      title={isEditing ? 'Edit Knowledge Item' : 'Save New Knowledge'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="k-title" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Title <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Starred' : 'Add to favorites'}
            </button>
          </div>
          <input
            id="k-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React 19 State Management Patterns & Hooks"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Source URL & Source Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="k-url" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Source URL
            </label>
            <input
              id="k-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="k-type" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Source Type
            </label>
            <select
              id="k-type"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              {SOURCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="k-cat" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              id="k-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="k-tags" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tags (Press Enter)
            </label>
            <input
              id="k-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="frontend, design, tip..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Tags Chips Display */}
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tagsList.map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-600 focus:outline-none"
                  aria-label={`Remove tag ${t}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Description / Notes */}
        <div>
          <label htmlFor="k-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Personal Notes & Key Takeaways
          </label>
          <textarea
            id="k-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write key takeaways, quotes, summary, or thoughts you may search for later..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors leading-relaxed resize-y"
          />
        </div>

        {/* Attachment Upload Section */}
        <div className="border-t border-slate-100 pt-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Optional Attachment (PDF, Images, Docs — max 15MB)
          </label>

          {/* Current Attached File */}
          {attachment && !newFile && (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{attachment.fileName}</span>
                <span className="text-xs text-slate-400">({formatBytes(attachment.fileSize)})</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveExistingAttachment}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* New Selected File */}
          {newFile && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-sm mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-emerald-950 truncate">{newFile.name}</span>
                  <span className="text-xs text-emerald-700">({formatBytes(newFile.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewFile(null)}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1"
                >
                  Cancel
                </button>
              </div>

              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-emerald-800 mt-1 inline-block">Uploading: {uploadProgress}%</span>
                </div>
              )}
            </div>
          )}

          {/* File Picker Button */}
          {!newFile && !attachment && (
            <div>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/20 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">Click to attach file or screenshot</span>
                <span className="text-[11px] text-slate-400">PNG, JPG, PDF, TXT, DOCX up to 15MB</span>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,text/*,.doc,.docx,.zip"
                />
              </label>
            </div>
          )}

          {fileError && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Save Knowledge'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
