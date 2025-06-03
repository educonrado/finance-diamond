// src/stores/categories.ts
import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Category } from '../types/Category';
import { USERS_COLLECTION, CATEGORIES_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths'; // Importa las constantes de rutas

// Asumimos un user-uid quemado por ahora
const USER_UID = 'user-uid';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    /**
     * Carga las categorías del usuario desde Firestore.
     */
    async fetchCategories() {
      this.isLoading = true;
      this.error = null;
      try {
        const q = collection(db, `${USERS_COLLECTION}/${USER_UID}/${CATEGORIES_COLLECTION}`);
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
        const docRef = await addDoc(collection(db, `${USERS_COLLECTION}/${USER_UID}/${CATEGORIES_COLLECTION}`), categoryData);
        this.categories.push({ id: docRef.id, ...categoryData });
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
     * @param categoryData Nuevos datos de la categoría.
     */
    async updateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id'>>) {
      this.isLoading = true;
      this.error = null;
      try {
        const categoryRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${CATEGORIES_COLLECTION}`, categoryId);
        await updateDoc(categoryRef, categoryData);
        const index = this.categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
          Object.assign(this.categories[index], categoryData);
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
        // Verificar si la categoría está en uso por alguna transacción
        const transactionsQuery = query(collection(db, `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`), where('categoryId', '==', categoryId));
        const transactionSnapshot = await getDocs(transactionsQuery);
        if (!transactionSnapshot.empty) {
          throw new Error('No se puede eliminar la categoría porque tiene transacciones asociadas.');
        }

        const categoryRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${CATEGORIES_COLLECTION}`, categoryId);
        await deleteDoc(categoryRef);
        this.categories = this.categories.filter(cat => cat.id !== categoryId);
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
