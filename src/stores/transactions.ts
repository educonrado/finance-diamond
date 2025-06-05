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
  Timestamp
} from 'firebase/firestore'
import type { Transaction } from '../types/Transaction'
import { useAccountsStore } from './accounts'
import { USERS_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths'
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

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTransactions() {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()

        const path = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`
        const q = query(collection(db, path), orderBy('date', 'desc'))
        const querySnapshot = await getDocs(q)

        this.transactions = querySnapshot.docs.map(doc => {
          const data = doc.data()
          const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
          return { id: doc.id, ...data, date } as Transaction
        })
      } catch (err: any) {
        this.error = err.message
        console.error('Error al cargar transacciones:', err)
      } finally {
        this.isLoading = false
      }
    },

    async addTransaction(transactionData: Omit<Transaction, 'id' | 'date'> & { date: Date }) {
      this.isLoading = true
      this.error = null
      const accountsStore = useAccountsStore()

      try {
        await waitForAuth()

        const path = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`
        const docRef = await addDoc(collection(db, path), {
          ...transactionData,
          date: Timestamp.fromDate(transactionData.date),
        })

        const newTransaction: Transaction = {
          id: docRef.id,
          ...transactionData,
          date: transactionData.date,
        }

        this.transactions.unshift(newTransaction)

        const account = accountsStore.accounts.find(acc => acc.id === newTransaction.accountId)
        if (account) {
          const newBalance =
            newTransaction.type === 'Ingreso'
              ? account.balance + newTransaction.amount
              : account.balance - newTransaction.amount

          await accountsStore.updateAccountBalance(newTransaction.accountId, newBalance)
        } else {
          throw new Error('Cuenta asociada no encontrada al añadir transacción.')
        }
      } catch (err: any) {
        this.error = err.message
        console.error('Error al añadir transacción:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateTransaction(transactionId: string, transactionData: Partial<Omit<Transaction, 'id' | 'date'>> & { date?: Date }) {
      this.isLoading = true
      this.error = null
      const accountsStore = useAccountsStore()

      try {
        await waitForAuth()

        const path = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`
        const oldTransaction = this.transactions.find(t => t.id === transactionId)
        if (!oldTransaction) throw new Error('Transacción no encontrada para actualizar.')

        const oldAccount = accountsStore.accounts.find(acc => acc.id === oldTransaction.accountId)
        if (oldAccount) {
          const revertedBalance =
            oldTransaction.type === 'Ingreso'
              ? oldAccount.balance - oldTransaction.amount
              : oldAccount.balance + oldTransaction.amount

          await accountsStore.updateAccountBalance(oldAccount.id, revertedBalance)
        }

        const transactionRef = doc(db, path, transactionId)
        const firestoreData: any = { ...transactionData }
        if (transactionData.date) {
          firestoreData.date = Timestamp.fromDate(transactionData.date)
        }

        await updateDoc(transactionRef, firestoreData)

        const targetAccountId = transactionData.accountId || oldTransaction.accountId
        const newAccount = accountsStore.accounts.find(acc => acc.id === targetAccountId)
        if (!newAccount) throw new Error('Nueva cuenta asociada no encontrada.')

        const effectiveAmount = transactionData.amount ?? oldTransaction.amount
        const effectiveType = transactionData.type ?? oldTransaction.type

        const newBalance =
          effectiveType === 'Ingreso'
            ? newAccount.balance + effectiveAmount
            : newAccount.balance - effectiveAmount

        await accountsStore.updateAccountBalance(newAccount.id, newBalance)

        const index = this.transactions.findIndex(t => t.id === transactionId)
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            ...transactionData,
            id: transactionId,
            date: transactionData.date || oldTransaction.date,
          }
        }
      } catch (err: any) {
        this.error = err.message
        console.error('Error al actualizar transacción:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteTransaction(transactionId: string) {
      this.isLoading = true
      this.error = null
      const accountsStore = useAccountsStore()

      try {
        await waitForAuth()

        const path = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`
        const transactionToDelete = this.transactions.find(t => t.id === transactionId)
        if (!transactionToDelete) throw new Error('Transacción no encontrada para eliminar.')

        const transactionRef = doc(db, path, transactionId)
        await deleteDoc(transactionRef)

        this.transactions = this.transactions.filter(t => t.id !== transactionId)

        const account = accountsStore.accounts.find(acc => acc.id === transactionToDelete.accountId)
        if (account) {
          const revertedBalance =
            transactionToDelete.type === 'Ingreso'
              ? account.balance - transactionToDelete.amount
              : account.balance + transactionToDelete.amount

          await accountsStore.updateAccountBalance(account.id, revertedBalance)
        }
      } catch (err: any) {
        this.error = err.message
        console.error('Error al eliminar transacción:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
