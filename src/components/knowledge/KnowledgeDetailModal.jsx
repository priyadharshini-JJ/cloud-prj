import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useKnowledge } from '../../context/KnowledgeContext';
import { SourceBadge, CategoryBadge, TagBadge } from '../common/Badge';
import { formatBytes } from '../../lib/storageService';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import {
  ExternalLink,
  Star,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Paperclip,
  Download,
  FileText
} from 'lucide-react';

export default function KnowledgeDetailModal() {
  const { detailModalItem, setDetailModalItem, openEditModal, removeItem, toggleFavoriteItem } = useKnowledge();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!detailModalItem) return null;

  const item = detailModalItem;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeItem(item.id, item.attachment);
      toast.success('Knowledge item deleted');
      setShowDeleteConfirm(false);
      setDetailModalItem(null);
    } catch (err) {
      toast.error('Failed to delete item: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isImageAttachment = item.attachment?.mimeType?.startsWith('image/');

  return (
    <>
      <Modal
        isOpen={Boolean(detailModalItem)}
        onClose={() => setDetailModalItem(null)}
        title="Knowledge Details"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <SourceBadge type={item.sourceType} />
              <CategoryBadge name={item.categoryName || 'General'} />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleFavoriteItem(item.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  item.isFavorite
                    ? 'text-amber-500 bg-amber-50 border-amber-200'
                    : 'text-slate-400 bg-white border-slate-200 hover:text-slate-600'
                }`}
                title={item.isFavorite ? 'Remove star' : 'Star this item'}
              >
                <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const toEdit = item;
                  setDetailModalItem(null);
                  openEditModal(toEdit);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Edit item"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-rose-600 hover:text-rose-700 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {item.title}
            </h2>
          </div>

          {/* Source Link */}
          {item.sourceUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Original Resource Link
              </div>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline break-all"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>{item.sourceUrl}</span>
              </a>
            </div>
          )}

          {/* Notes / Description */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Personal Notes & Recovery Context
            </div>
            {item.description ? (
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {item.description}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No notes provided for this item.</p>
            )}
          </div>

          {/* Tags */}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map(t => (
                  <TagBadge key={t} tag={t} />
                ))}
              </div>
            </div>
          )}

          {/* Attachment Preview / Download */}
          {item.attachment && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Attached Document or Image
              </div>
              
              {isImageAttachment && item.attachment.downloadUrl && (
                <div className="mb-3 max-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={item.attachment.downloadUrl}
                    alt={item.attachment.fileName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.attachment.fileName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(item.attachment.fileSize)} • {item.attachment.mimeType}
                    </p>
                  </div>
                </div>

                {item.attachment.downloadUrl && (
                  <a
                    href={item.attachment.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.attachment.fileName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-xs font-medium text-slate-700 hover:text-emerald-700 rounded-lg shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open / Download
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Saved: {formatDate(item.createdAt)}</span>
            </div>
            {item.updatedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated: {formatDate(item.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Knowledge Item"
        message={`Are you sure you want to permanently delete "${item.title}"?`}
        confirmText="Delete Permanently"
        isLoading={isDeleting}
      />
    </>
  );
}
