// src/stores/categories.ts
import { defineStore } from 'pinia'
import { db } from '../firebase/config'
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { Category } from '../types/Category'
import { USERS_COLLECTION, CATEGORIES_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths'
import { useAuth } from '@/composables/useAuth'

const { userUid, isInitialized } = useAuth()

const waitForAuth = async () => {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (isInitialized.value && userUid.value) {
        resolve()
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCategories() {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const path = `${USERS_COLLECTION}/${userUid.value}/${CATEGORIES_COLLECTION}`
        const q = query(collection(db, path), orderBy('name', 'asc'))

        const querySnapshot = await getDocs(q)
        this.categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
      } catch (err: any) {
        this.error = err.message
        console.error('Error al cargar categorías:', err)
      } finally {
        this.isLoading = false
      }
    },

    async addCategory(categoryData: Omit<Category, 'id'>) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const path = `${USERS_COLLECTION}/${userUid.value}/${CATEGORIES_COLLECTION}`
        const docRef = await addDoc(collection(db, path), categoryData)
        const newCategory: Category = { id: docRef.id, ...categoryData }
        this.categories.push(newCategory)
        this.categories.sort((a, b) => a.name.localeCompare(b.name))
      } catch (err: any) {
        this.error = err.message
        console.error('Error al añadir categoría:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'type'>>) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const path = `${USERS_COLLECTION}/${userUid.value}/${CATEGORIES_COLLECTION}`
        const categoryRef = doc(db, path, categoryId)

        await updateDoc(categoryRef, categoryData)

        const index = this.categories.findIndex(cat => cat.id === categoryId)
        if (index !== -1) {
          Object.assign(this.categories[index], categoryData)
          this.categories.sort((a, b) => a.name.localeCompare(b.name))
        }
      } catch (err: any) {
        this.error = err.message
        console.error('Error al actualizar categoría:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteCategory(categoryId: string) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const txPath = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`
        const catPath = `${USERS_COLLECTION}/${userUid.value}/${CATEGORIES_COLLECTION}`

        const q = query(collection(db, txPath), where('categoryId', '==', categoryId))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          throw new Error('No se puede eliminar la categoría porque tiene transacciones asociadas.')
        }

        const categoryRef = doc(db, catPath, categoryId)
        await deleteDoc(categoryRef)
        this.categories = this.categories.filter(cat => cat.id !== categoryId)
      } catch (err: any) {
        this.error = err.message
        console.error('Error al eliminar categoría:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
