import React, { useState } from 'react';
import { Star, ExternalLink, Paperclip, MoreVertical, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { SourceBadge, CategoryBadge, TagBadge } from '../common/Badge';
import { formatBytes } from '../../lib/storageService';
import ConfirmDialog from '../common/ConfirmDialog';
import { useKnowledge } from '../../context/KnowledgeContext';
import { useToast } from '../common/Toast';

export default function KnowledgeCard({ item, onSelectTag }) {
  const { toggleFavoriteItem, removeItem, openEditModal, setDetailModalItem } = useKnowledge();
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeItem(item.id, item.attachment);
      toast.success('Knowledge item removed successfully');
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error('Failed to remove item: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e) => {
    // Avoid triggering when clicking links, buttons, or action menu
    if (e.target.closest('button') || e.target.closest('a')) return;
    setDetailModalItem(item);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
      >
        <div>
          {/* Top metadata row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <SourceBadge type={item.sourceType} />
              <CategoryBadge name={item.categoryName || 'General'} />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoriteItem(item.id);
                }}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  item.isFavorite
                    ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                }`}
                title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label="Toggle favorite"
              >
                <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Action Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
                  aria-label="Item actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />
                    <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-sm animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          setDetailModalItem(item);
                        }}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Full
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          openEditModal(item);
                        }}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-2">
            {item.title}
          </h3>

          {/* Description snippet */}
          {item.description && (
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-3">
              {item.description}
            </p>
          )}

          {/* Source URL link */}
          {item.sourceUrl && (
            <div className="mb-3">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline truncate max-w-full"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.sourceUrl}</span>
              </a>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onClick={
                    onSelectTag
                      ? (e) => {
                          e.stopPropagation();
                          onSelectTag(tag);
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Footer: Attachment indicator & timestamp */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(item.createdAt)}</span>
          </div>

          {item.attachment && (
            <div
              className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
              title={`Attached: ${item.attachment.fileName} (${formatBytes(item.attachment.fileSize)})`}
            >
              <Paperclip className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[120px] font-medium">{item.attachment.fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation before deletion */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Knowledge Item"
        message={`Are you sure you want to permanently delete "${item.title}"? ${
          item.attachment ? 'This will also delete the uploaded attachment file.' : ''
        }`}
        confirmText="Delete Permanently"
        isLoading={isDeleting}
      />
    </>
  );
}
