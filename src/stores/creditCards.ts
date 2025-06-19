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
  orderBy,
  where,
} from 'firebase/firestore'
import type { CreditCardAccount } from '../types/CreditCardAccount'
import { USERS_COLLECTION, CREDIT_CARDS_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths'
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

export const useCreditCardsStore = defineStore('creditCards', {
  state: () => ({
    creditCards: [] as CreditCardAccount[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCreditCards() {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const path = `${USERS_COLLECTION}/${userUid.value}/${CREDIT_CARDS_COLLECTION}`
        const q = query(collection(db, path), orderBy('name', 'asc'))

        const querySnapshot = await getDocs(q)
        this.creditCards = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as CreditCardAccount))
      } catch (err: any) {
        this.error = err.message
        console.error('Error al cargar tarjetas de crédito:', err)
      } finally {
        this.isLoading = false
      }
    },

    async addCreditCard(cardData: Omit<CreditCardAccount, 'id' | 'type' | 'balance'> & { initialAmountUsed?: number }) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const path = `${USERS_COLLECTION}/${userUid.value}/${CREDIT_CARDS_COLLECTION}`

        // Validaciones básicas
        if (!cardData.creditLimit || cardData.creditLimit <= 0) throw new Error('El límite de crédito debe ser mayor que cero.')
        if (!cardData.billingCycleDay || cardData.billingCycleDay < 1 || cardData.billingCycleDay > 31) throw new Error('El día de corte debe estar entre 1 y 31.')
        if (!cardData.paymentDueDay || cardData.paymentDueDay < 1 || cardData.paymentDueDay > 31) throw new Error('El día de pago debe estar entre 1 y 31.')

        const docRef = await addDoc(collection(db, path), {
          name: cardData.name,
          cardType: cardData.cardType,
          creditLimit: cardData.creditLimit,
          billingCycleDay: cardData.billingCycleDay,
          paymentDueDay: cardData.paymentDueDay,
          balance: cardData.initialAmountUsed ? -Math.abs(cardData.initialAmountUsed) : 0,
          type: 'creditCard',
        })

        this.creditCards.sort((a, b) => a.name.localeCompare(b.name))
      } catch (err: any) {
        this.error = err.message
        console.error('Error al añadir tarjeta de crédito:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateCreditCard(cardId: string, cardData: Partial<Omit<CreditCardAccount, 'id' | 'type'>>) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        const path = `${USERS_COLLECTION}/${userUid.value}/${CREDIT_CARDS_COLLECTION}`
        const cardRef = doc(db, path, cardId)

        // Si se cambia el valor usado inicial, recalcula el balance
        if ('initialAmountUsed' in cardData && typeof cardData.initialAmountUsed === 'number') {
          cardData.balance = -Math.abs(cardData.initialAmountUsed)
          delete cardData.initialAmountUsed
        }

        await updateDoc(cardRef, cardData)

        const idx = this.creditCards.findIndex(card => card.id === cardId);
        if (idx !== -1) {
          this.creditCards[idx] = {
            ...this.creditCards[idx],
            ...cardData,
          };
        }
      } catch (err: any) {
        this.error = err.message
        console.error('Error al actualizar tarjeta de crédito:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteCreditCard(cardId: string) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()
        // Eliminar transacciones asociadas a la tarjeta
        const txPath = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`
        const q = query(collection(db, txPath), where('accountId', '==', cardId))
        const querySnapshot = await getDocs(q)
        for (const txDoc of querySnapshot.docs) {
          await deleteDoc(txDoc.ref)
        }

        // Eliminar la tarjeta
        const path = `${USERS_COLLECTION}/${userUid.value}/${CREDIT_CARDS_COLLECTION}`
        const cardRef = doc(db, path, cardId)
        await deleteDoc(cardRef)
        this.creditCards = this.creditCards.filter(card => card.id !== cardId)
      } catch (err: any) {
        this.error = err.message
        console.error('Error al eliminar tarjeta de crédito:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})