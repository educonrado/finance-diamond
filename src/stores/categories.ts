// src/stores/categories.ts
import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'; // Importa orderBy
import type { Category } from '../types/Category';
import { USERS_COLLECTION, CATEGORIES_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths';
import { USER_UID } from '../composables/useUserSetup';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    userCollectionPath(): string {
      return `${USERS_COLLECTION}/${USER_UID}/${CATEGORIES_COLLECTION}`;
    }
  },
  actions: {
    async fetchCategories() {
      this.isLoading = true;
      this.error = null;
      try {
        const q = query(collection(db, this.userCollectionPath), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        this.categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al cargar categorías:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Añade una nueva categoría a Firestore.
     * @param categoryData Datos de la nueva categoría (sin 'id').
     */
    async addCategory(categoryData: Omit<Category, 'id'>) {
      this.isLoading = true;
      this.error = null;
      try {
        console.log('Adding category to path:', this.userCollectionPath, categoryData);
        const docRef = await addDoc(collection(db, this.userCollectionPath), categoryData);
        const newCategory: Category = { id: docRef.id, ...categoryData };
        this.categories.push(newCategory);
        // Re-ordenar localmente después de añadir para mantener la consistencia visual
        this.categories.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Category added:', newCategory);
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al añadir categoría:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza una categoría existente en Firestore.
     * @param categoryId ID de la categoría a actualizar.
     * @param categoryData Nuevos datos de la categoría (Partial<Omit<Category, 'id' | 'type'>>).
     * El tipo NO se puede actualizar.
     */
    async updateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'type'>>) {
      this.isLoading = true;
      this.error = null;
      try {
        const categoryRef = doc(db, this.userCollectionPath, categoryId);
        const updateData: Partial<Omit<Category, 'id' | 'type'>> = { ...categoryData };

        await updateDoc(categoryRef, updateData);
        const index = this.categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
          Object.assign(this.categories[index], updateData);
          // Re-ordenar localmente después de actualizar por si el nombre cambió
          this.categories.sort((a, b) => a.name.localeCompare(b.name));
          console.log('Category updated:', this.categories[index]);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al actualizar categoría:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Elimina una categoría de Firestore.
     * @param categoryId ID de la categoría a eliminar.
     */
    async deleteCategory(categoryId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const transactionsCollectionPath = `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`;
        const q = query(collection(db, transactionsCollectionPath), where('categoryId', '==', categoryId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error('No se puede eliminar la categoría porque tiene transacciones asociadas.');
        }

        const categoryRef = doc(db, this.userCollectionPath, categoryId);
        await deleteDoc(categoryRef);
        this.categories = this.categories.filter(cat => cat.id !== categoryId);
        console.log('Category deleted:', categoryId);
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al eliminar categoría:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
