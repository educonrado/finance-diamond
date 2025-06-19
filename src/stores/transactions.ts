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
import { USERS_COLLECTION, TRANSACTIONS_COLLECTION, CREDIT_CARDS_COLLECTION } from '../constants/firestorePaths'
import { useAuth } from '@/composables/useAuth'
import { useCreditCardsStore } from './creditCards'

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
      const creditCardsStore = useCreditCardsStore()

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
        const creditCard = creditCardsStore.creditCards.find(card => card.id === newTransaction.accountId)

        if (account) {
          const newBalance =
            newTransaction.type === 'Ingreso'
              ? account.balance + newTransaction.amount
              : account.balance - newTransaction.amount

          await accountsStore.updateAccountBalance(newTransaction.accountId, newBalance)
        } else if (creditCard) {
          const newBalance =
            newTransaction.type === 'Ingreso'
              ? creditCard.balance + newTransaction.amount
              : creditCard.balance - newTransaction.amount

          await creditCardsStore.updateCreditCard(newTransaction.accountId, { balance: newBalance });
        }
        else {
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
    async updateTransaction(
      transactionId: string,
      transactionData: Partial<Omit<Transaction, 'id' | 'date'>> & { date?: Date }
    ) {
      this.isLoading = true;
      this.error = null;
      const accountsStore = useAccountsStore();
      const creditCardsStore = useCreditCardsStore();

      try {
        // 1. Busca la transacción original
        const oldTransaction = this.transactions.find(t => t.id === transactionId);
        if (!oldTransaction) throw new Error('Transacción no encontrada.');

        // 2. Revertir el efecto de la transacción anterior
        const oldAccount = accountsStore.accounts.find(acc => acc.id === oldTransaction.accountId);
        const oldCreditCard = creditCardsStore.creditCards.find(card => card.id === oldTransaction.accountId);

        if (oldAccount) {
          const revertedBalance =
            oldTransaction.type === 'Ingreso'
              ? oldAccount.balance - oldTransaction.amount
              : oldAccount.balance + oldTransaction.amount;
          await accountsStore.updateAccountBalance(oldAccount.id, revertedBalance);
        } else if (oldCreditCard) {
          const revertedBalance =
            oldTransaction.type === 'Ingreso'
              ? oldCreditCard.balance - oldTransaction.amount
              : oldCreditCard.balance + oldTransaction.amount;
          await creditCardsStore.updateCreditCard(oldCreditCard.id, { balance: revertedBalance });
        }

        // 3. Actualizar la transacción en Firestore
        const updatedTransaction = {
          ...oldTransaction,
          ...transactionData,
          date: transactionData.date ? Timestamp.fromDate(transactionData.date) : oldTransaction.date,
        };
        const path = `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`;
        const docRef = doc(db, path, transactionId);
        await updateDoc(docRef, updatedTransaction);

        // 4. Aplicar el efecto de la nueva transacción
        const targetAccountId = transactionData.accountId || oldTransaction.accountId;
        const effectiveType = transactionData.type || oldTransaction.type;
        const effectiveAmount = transactionData.amount ?? oldTransaction.amount;

        const newAccount = accountsStore.accounts.find(acc => acc.id === targetAccountId);
        const newCreditCard = creditCardsStore.creditCards.find(card => card.id === targetAccountId);

        if (newAccount) {
          const newBalance =
            effectiveType === 'Ingreso'
              ? newAccount.balance + effectiveAmount
              : newAccount.balance - effectiveAmount;
          await accountsStore.updateAccountBalance(newAccount.id, newBalance);
        } else if (newCreditCard) {
          const newBalance =
            effectiveType === 'Ingreso'
              ? newCreditCard.balance + effectiveAmount
              : newCreditCard.balance - effectiveAmount;
          await creditCardsStore.updateCreditCard(newCreditCard.id, { balance: newBalance });
        } else {
          throw new Error('Nueva cuenta asociada no encontrada.');
        }

        // 5. Refresca las transacciones locales
        await this.fetchTransactions();

      } catch (err: any) {
        this.error = err.message || 'Error al actualizar la transacción.';
      } finally {
        this.isLoading = false;
      }
    },

    async deleteTransaction(transactionId: string) {
      this.isLoading = true;
      this.error = null;
      const accountsStore = useAccountsStore();
      const creditCardsStore = useCreditCardsStore();

      try {
        // 1. Busca la transacción a eliminar
        const transactionToDelete = this.transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) throw new Error('Transacción no encontrada.');

        // 2. Revertir el efecto de la transacción
        const account = accountsStore.accounts.find(acc => acc.id === transactionToDelete.accountId);
        const creditCard = creditCardsStore.creditCards.find(card => card.id === transactionToDelete.accountId);

        if (account) {
          const revertedBalance =
            transactionToDelete.type === 'Ingreso'
              ? account.balance - transactionToDelete.amount
              : account.balance + transactionToDelete.amount;
          await accountsStore.updateAccountBalance(account.id, revertedBalance);
        } else if (creditCard) {
          const revertedBalance =
            transactionToDelete.type === 'Ingreso'
              ? creditCard.balance - transactionToDelete.amount
              : creditCard.balance + transactionToDelete.amount;
          await creditCardsStore.updateCreditCard(creditCard.id, { balance: revertedBalance });
        }

        // 3. Eliminar la transacción en Firestore
        const transaccionRef = doc(db, `${USERS_COLLECTION}/${userUid.value}/${TRANSACTIONS_COLLECTION}`, transactionId);
        await deleteDoc(transaccionRef);

        // 4. Refresca las transacciones locales
        await this.fetchTransactions();

      } catch (err: any) {
        this.error = err.message || 'Error al eliminar la transacción.';
      } finally {
        this.isLoading = false;
      }
    },
  }
});
