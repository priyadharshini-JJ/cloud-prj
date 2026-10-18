import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { deleteAttachment } from './storageService';
import { DEFAULT_CATEGORIES } from './defaultCategories';

const LOCAL_STORAGE_ITEMS_KEY = 'echocloud_local_items_';
const LOCAL_STORAGE_CATEGORIES_KEY = 'echocloud_local_categories_';

// Initial sample items for new demo users so they immediately experience the system
const INITIAL_DEMO_ITEMS = [
  {
    id: 'demo-item-1',
    title: 'React 19 Server Components & Actions Guide',
    description: 'Key takeaways on the new useActionState hook, optimistic updates, and async transitions without tearing.',
    sourceUrl: 'https://react.dev/reference/react/useActionState',
    sourceType: 'Website',
    categoryId: 'development',
    categoryName: 'Development',
    tags: ['react', 'frontend', 'javascript', 'hooks'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'demo-item-2',
    title: 'Designing Accessible Web Dialogs and Modals',
    description: 'Remember to use native <dialog> or trap focus, restore focus on close, and link aria-labelledby properly.',
    sourceUrl: 'https://web.dev/articles/building-a-dialog-component',
    sourceType: 'Research Paper',
    categoryId: 'learning',
    categoryName: 'Learning',
    tags: ['a11y', 'dialog', 'css', 'accessibility'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-item-3',
    title: 'System Architecture Notes: Distributed Key-Value Store',
    description: 'Consensus algorithms review: Raft leader election invariants, log compaction strategies, and quorum sizes.',
    sourceUrl: 'https://raft.github.io/',
    sourceType: 'Code',
    categoryId: 'research',
    categoryName: 'Research',
    tags: ['raft', 'distributed-systems', 'architecture'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Helper to access local storage per user
function getLocalItems(userId) {
  const data = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY + userId);
  if (!data) {
    // initialize demo items for fresh experience
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY + userId, JSON.stringify(INITIAL_DEMO_ITEMS));
    return INITIAL_DEMO_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalItems(userId, items) {
  localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY + userId, JSON.stringify(items));
}

function getLocalCategories(userId) {
  const data = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY + userId);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY + userId, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveLocalCategories(userId, categories) {
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY + userId, JSON.stringify(categories));
}

/**
 * Fetch all items for the user
 */
export async function getUserItems(userId) {
  if (!userId) return [];

  if (isFirebaseConfigured && db) {
    try {
      const itemsRef = collection(db, 'users', userId, 'items');
      const q = query(itemsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.warn('Falling back to local cache due to Firestore error:', err.message);
      return getLocalItems(userId);
    }
  }

  return getLocalItems(userId);
}

/**
 * Add a new knowledge item
 */
export async function addItem(userId, itemData) {
  if (!userId) throw new Error('User is required to save knowledge');

  const cleanData = {
    title: itemData.title?.trim(),
    description: itemData.description?.trim() || '',
    sourceUrl: itemData.sourceUrl?.trim() || '',
    sourceType: itemData.sourceType || 'Website',
    categoryId: itemData.categoryId || 'development',
    categoryName: itemData.categoryName || 'Development',
    tags: Array.isArray(itemData.tags) ? itemData.tags : [],
    isFavorite: Boolean(itemData.isFavorite),
    attachment: itemData.attachment || null,
    userId,
  };

  if (!cleanData.title) {
    throw new Error('Title is required');
  }

  if (isFirebaseConfigured && db) {
    try {
      const itemsRef = collection(db, 'users', userId, 'items');
      const docRef = await addDoc(itemsRef, {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        id: docRef.id,
        ...cleanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Firestore save failed:', err);
      throw err;
    }
  }

  // Local demo store
  const localItems = getLocalItems(userId);
  const newItem = {
    id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    ...cleanData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveLocalItems(userId, [newItem, ...localItems]);
  return newItem;
}

/**
 * Update an existing knowledge item
 */
export async function updateItem(userId, itemId, itemData) {
  if (!userId || !itemId) throw new Error('User ID and Item ID are required');

  const updatePayload = {
    title: itemData.title?.trim(),
    description: itemData.description?.trim() || '',
    sourceUrl: itemData.sourceUrl?.trim() || '',
    sourceType: itemData.sourceType || 'Website',
    categoryId: itemData.categoryId || 'development',
    categoryName: itemData.categoryName || 'Development',
    tags: Array.isArray(itemData.tags) ? itemData.tags : [],
    isFavorite: Boolean(itemData.isFavorite),
    userId,
  };

  if (itemData.attachment !== undefined) {
    updatePayload.attachment = itemData.attachment;
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', userId, 'items', itemId);
      await updateDoc(docRef, {
        ...updatePayload,
        updatedAt: serverTimestamp(),
      });
      return {
        id: itemId,
        ...updatePayload,
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Firestore update failed:', err);
      throw err;
    }
  }

  // Local fallback
  const items = getLocalItems(userId);
  const index = items.findIndex(i => i.id === itemId);
  if (index !== -1) {
    const updated = {
      ...items[index],
      ...updatePayload,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    saveLocalItems(userId, items);
    return updated;
  }
  throw new Error('Item not found');
}

/**
 * Delete a knowledge item (and its attachment if present)
 */
export async function deleteItem(userId, itemId, attachment) {
  if (!userId || !itemId) return;

  // Cleanup attachment in Storage if exists
  if (attachment?.storagePath) {
    await deleteAttachment(attachment.storagePath);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', userId, 'items', itemId);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.error('Firestore delete failed:', err);
      throw err;
    }
  }

  const items = getLocalItems(userId);
  const filtered = items.filter(i => i.id !== itemId);
  saveLocalItems(userId, filtered);
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(userId, itemId, currentStatus) {
  const newStatus = !currentStatus;
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', userId, 'items', itemId);
      await updateDoc(docRef, {
        isFavorite: newStatus,
        updatedAt: serverTimestamp(),
      });
      return newStatus;
    } catch (err) {
      console.error('Firestore favorite toggle failed:', err);
      throw err;
    }
  }

  const items = getLocalItems(userId);
  const index = items.findIndex(i => i.id === itemId);
  if (index !== -1) {
    items[index].isFavorite = newStatus;
    items[index].updatedAt = new Date().toISOString();
    saveLocalItems(userId, items);
  }
  return newStatus;
}

/**
 * User Categories CRUD
 */
export async function getUserCategories(userId) {
  if (!userId) return DEFAULT_CATEGORIES;

  if (isFirebaseConfigured && db) {
    try {
      const catRef = collection(db, 'users', userId, 'categories');
      const snapshot = await getDocs(catRef);
      if (snapshot.empty) {
        return DEFAULT_CATEGORIES;
      }
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Categories read error, fallback to defaults:', err.message);
      return getLocalCategories(userId);
    }
  }

  return getLocalCategories(userId);
}

export async function addCategory(userId, categoryData) {
  const cleanCat = {
    name: categoryData.name?.trim(),
    color: categoryData.color || 'emerald',
    description: categoryData.description?.trim() || '',
    userId,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    const catRef = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(catRef, cleanCat);
    return { id: docRef.id, ...cleanCat };
  }

  const list = getLocalCategories(userId);
  const newCat = {
    id: 'cat-' + Date.now(),
    ...cleanCat
  };
  saveLocalCategories(userId, [...list, newCat]);
  return newCat;
}

export async function updateCategory(userId, categoryId, categoryData) {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'categories', categoryId);
    await updateDoc(docRef, categoryData);
    return { id: categoryId, ...categoryData };
  }

  const list = getLocalCategories(userId);
  const index = list.findIndex(c => c.id === categoryId);
  if (index !== -1) {
    list[index] = { ...list[index], ...categoryData };
    saveLocalCategories(userId, list);
    return list[index];
  }
  throw new Error('Category not found');
}

export async function deleteCategory(userId, categoryId) {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(docRef);
    return;
  }

  const list = getLocalCategories(userId);
  saveLocalCategories(userId, list.filter(c => c.id !== categoryId));
}

/**
 * Export all user knowledge data as JSON
 */
export async function exportUserData(userId) {
  const items = await getUserItems(userId);
  const categories = await getUserCategories(userId);

  return {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    system: 'EchoCloud — AI-Powered Personal Knowledge Recovery System',
    userId,
    totalItems: items.length,
    items,
    categories
  };
}

/**
 * Delete all user data (Items, Categories, and Attachments)
 */
export async function deleteAllUserData(userId) {
  const items = await getUserItems(userId);

  // 1. Delete all attachments
  for (const item of items) {
    if (item.attachment?.storagePath) {
      await deleteAttachment(item.attachment.storagePath);
    }
  }

  // 2. Delete Firestore collections
  if (isFirebaseConfigured && db) {
    const itemsRef = collection(db, 'users', userId, 'items');
    const itemsSnap = await getDocs(itemsRef);
    const batch = writeBatch(db);
    itemsSnap.forEach(d => batch.delete(d.ref));

    const catRef = collection(db, 'users', userId, 'categories');
    const catSnap = await getDocs(catRef);
    catSnap.forEach(d => batch.delete(d.ref));

    await batch.commit();
  }

  // Clear local storage
  localStorage.removeItem(LOCAL_STORAGE_ITEMS_KEY + userId);
  localStorage.removeItem(LOCAL_STORAGE_CATEGORIES_KEY + userId);
}
