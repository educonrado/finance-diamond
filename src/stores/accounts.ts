//src\stores\accounts.ts
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
import type { Account } from '../types/Account'
import {
  USERS_COLLECTION,
  ACCOUNTS_COLLECTION,
  TRANSACTIONS_COLLECTION,
} from '../constants/firestorePaths'
import { useAuth } from '../composables/useAuth'

const { userUid, isInitialized } = useAuth()

// Espera hasta que el usuario esté autenticado
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

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Account[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAccounts() {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()

        const q = query(
          collection(db, `${USERS_COLLECTION}/${userUid.value}/${ACCOUNTS_COLLECTION}`),
          orderBy('name', 'asc')
        )

        const querySnapshot = await getDocs(q)

        this.accounts = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            initialBalance: parseFloat(data.initialBalance || 0),
            balance: parseFloat(data.balance || 0),
            color: data.color,
          } as Account
        })
      } catch (err: any) {
        this.error = err.message
        console.error('Error al cargar cuentas:', err)
      } finally {
        this.isLoading = false
      }
    },

    async addAccount(accountData: Omit<Account, 'id' | 'balance'>) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()

        const initialBalanceAsNumber = parseFloat(accountData.initialBalance.toString())

        const docRef = await addDoc(
          collection(db, `${USERS_COLLECTION}/${userUid.value}/${ACCOUNTS_COLLECTION}`),
          {
            ...accountData,
            balance: initialBalanceAsNumber,
          }
        )

        this.accounts.push({
          id: docRef.id,
          ...accountData,
          balance: initialBalanceAsNumber,
        })
      } catch (err: any) {
        this.error = err.message
        console.error('Error al añadir cuenta:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateAccount(accountId: string, accountData: Partial<Omit<Account, 'id'>>) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()

        const accountRef = doc(db, `${USERS_COLLECTION}/${userUid.value}/${ACCOUNTS_COLLECTION}`, accountId)

        await updateDoc(accountRef, accountData)

        const index = this.accounts.findIndex((acc) => acc.id === accountId)
        if (index !== -1) {
          Object.assign(this.accounts[index], accountData)
        }
      } catch (err: any) {
        this.error = err.message
        console.error('Error al actualizar cuenta:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteAccount(accountId: string) {
      this.isLoading = true
      this.error = null

      try {
        await waitForAuth()

        const q = query(
          collection(db, `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`),
          where('accountId', '==', accountId)
        )

        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          throw new Error('No se puede eliminar la cuenta porque tiene transacciones asociadas.')
        }

        const accountRef = doc(db, `${USERS_COLLECTION}/${userUid.value}/${ACCOUNTS_COLLECTION}`, accountId)
        await deleteDoc(accountRef)

        this.accounts = this.accounts.filter((acc) => acc.id !== accountId)
      } catch (err: any) {
        this.error = err.message
        console.error('Error al eliminar cuenta:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateAccountBalance(accountId: string, newBalance: number) {
      try {
        await waitForAuth()

        const accountRef = doc(db, `${USERS_COLLECTION}/${userUid.value}/${ACCOUNTS_COLLECTION}`, accountId)
        const balanceToUpdate = parseFloat(newBalance.toFixed(2))

        await updateDoc(accountRef, { balance: balanceToUpdate })

        const index = this.accounts.findIndex((acc) => acc.id === accountId)
        if (index !== -1) {
          this.accounts[index].balance = balanceToUpdate
          console.log(`Balance actualizado para ${this.accounts[index].name}: ${balanceToUpdate}`)
        }
      } catch (err: any) {
        console.error('Error al actualizar saldo de cuenta:', err)
      }
    },
  },
})
