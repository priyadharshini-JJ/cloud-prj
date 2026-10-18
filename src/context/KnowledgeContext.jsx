import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserItems,
  addItem,
  updateItem,
  deleteItem,
  toggleFavorite,
  getUserCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  exportUserData,
  deleteAllUserData
} from '../lib/knowledgeRepo';
import {
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches
} from '../lib/search';

const KnowledgeContext = createContext(null);

export function KnowledgeProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Modal control state accessible globally
  const [modalState, setModalState] = useState({
    isOpen: false,
    itemToEdit: null,
    defaultCategoryId: null,
  });

  const [detailModalItem, setDetailModalItem] = useState(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch items & categories when authenticated user changes
  const refreshData = useCallback(async () => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [fetchedItems, fetchedCategories] = await Promise.all([
        getUserItems(user.uid),
        getUserCategories(user.uid)
      ]);
      setItems(fetchedItems);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error loading knowledge data:', err);
      setError(err.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived unique tags
  const tags = useMemo(() => {
    const set = new Set();
    items.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => t && set.add(t.toLowerCase()));
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Derived dashboard statistics
  const stats = useMemo(() => {
    const total = items.length;
    const favorites = items.filter(i => i.isFavorite).length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = items.filter(i => new Date(i.createdAt).getTime() > sevenDaysAgo).length;

    // Distribution by category
    const categoryDistribution = {};
    categories.forEach(c => {
      categoryDistribution[c.id] = {
        name: c.name,
        color: c.color,
        count: 0
      };
    });

    items.forEach(item => {
      const catId = item.categoryId || 'other';
      if (!categoryDistribution[catId]) {
        categoryDistribution[catId] = {
          name: item.categoryName || 'Other',
          color: 'slate',
          count: 0
        };
      }
      categoryDistribution[catId].count++;
    });

    return {
      total,
      favorites,
      recent,
      categoryDistribution: Object.values(categoryDistribution).filter(c => c.count > 0 || categories.some(cat => cat.id === c.name.toLowerCase())),
    };
  }, [items, categories]);

  // Knowledge Items actions
  const createItem = async (itemData) => {
    if (!user?.uid) throw new Error('You must be logged in to save knowledge.');
    const newItem = await addItem(user.uid, itemData);
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const editItem = async (itemId, itemData) => {
    if (!user?.uid) throw new Error('You must be logged in to update knowledge.');
    const updated = await updateItem(user.uid, itemId, itemData);
    setItems(prev => prev.map(item => item.id === itemId ? updated : item));
    if (detailModalItem?.id === itemId) {
      setDetailModalItem(updated);
    }
    return updated;
  };

  const removeItem = async (itemId, attachment) => {
    if (!user?.uid) return;
    await deleteItem(user.uid, itemId, attachment);
    setItems(prev => prev.filter(item => item.id !== itemId));
    if (detailModalItem?.id === itemId) {
      setDetailModalItem(null);
    }
  };

  const toggleFavoriteItem = async (itemId) => {
    if (!user?.uid) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newStatus = await toggleFavorite(user.uid, itemId, item.isFavorite);
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, isFavorite: newStatus } : i))
    );
    if (detailModalItem?.id === itemId) {
      setDetailModalItem(prev => ({ ...prev, isFavorite: newStatus }));
    }
  };

  // Category Actions
  const createCategory = async (catData) => {
    if (!user?.uid) return;
    const newCat = await addCategory(user.uid, catData);
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const editCategory = async (catId, catData) => {
    if (!user?.uid) return;
    const updated = await updateCategory(user.uid, catId, catData);
    setCategories(prev => prev.map(c => c.id === catId ? updated : c));
    return updated;
  };

  const removeCategory = async (catId) => {
    if (!user?.uid) return;
    await deleteCategory(user.uid, catId);
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Recent searches actions
  const recordSearch = (query) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
  };

  const clearSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Global modal triggers
  const openCreateModal = (defaultCategoryId = null) => {
    setModalState({ isOpen: true, itemToEdit: null, defaultCategoryId });
  };

  const openEditModal = (item) => {
    setModalState({ isOpen: true, itemToEdit: item, defaultCategoryId: item.categoryId });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, itemToEdit: null, defaultCategoryId: null });
  };

  // Export & Delete Account Data
  const exportData = async () => {
    if (!user?.uid) throw new Error('No authenticated user');
    return await exportUserData(user.uid);
  };

  const wipeAllData = async () => {
    if (!user?.uid) throw new Error('No authenticated user');
    await deleteAllUserData(user.uid);
    setItems([]);
    setCategories([]);
    clearSearches();
  };

  const value = {
    items,
    categories,
    tags,
    loading,
    error,
    stats,
    recentSearches,
    modalState,
    detailModalItem,
    setDetailModalItem,
    openCreateModal,
    openEditModal,
    closeModal,
    refreshData,
    createItem,
    editItem,
    removeItem,
    toggleFavoriteItem,
    createCategory,
    editCategory,
    removeCategory,
    recordSearch,
    clearSearches,
    exportData,
    wipeAllData
  };

  return (
    <KnowledgeContext.Provider value={value}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
}
