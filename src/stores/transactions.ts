// src/stores/transactions.ts
import { defineStore } from 'pinia';
import { db } from '../firebase/config'; // Importa la instancia de Firestore
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Transaction } from '../types/Transaction'; // Importa la interfaz de Transacción
import { useAccountsStore } from './accounts'; // Importa el store de Cuentas para actualizar saldos
import { USERS_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths'; // Importa las constantes de rutas
import { USER_UID } from '../composables/useUserSetup'; // Importa el USER_UID desde el composable

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[], // Array para almacenar las transacciones
    isLoading: false, // Indicador de carga
    error: null as string | null, // Para mensajes de error
  }),
  actions: {
    /**
     * Carga las transacciones del usuario desde Firestore.
     * Las ordena por fecha de forma descendente (más reciente primero).
     */
    async fetchTransactions() {
      this.isLoading = true;
      this.error = null;
      try {
        // Asegúrate de que USER_UID.value no sea null antes de usarlo
        if (!USER_UID) {
          console.warn('USER_UID no está disponible. No se pueden cargar transacciones.');
          this.isLoading = false;
          return;
        }
        const q = query(collection(db, `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        this.transactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Convertir Timestamp de Firestore a Date para el estado de Pinia
          const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
          return { id: doc.id, ...data, date: date } as Transaction;
        });
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al cargar transacciones:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Añade una nueva transacción a Firestore y actualiza el saldo de la cuenta asociada.
     * @param transactionData Datos de la nueva transacción (sin 'id', con 'date' como Date).
     */
    async addTransaction(transactionData: Omit<Transaction, 'id' | 'date'> & { date: Date }) { // Recibe Date
      this.isLoading = true;
      this.error = null;
      const accountsStore = useAccountsStore(); // Accede al store de Cuentas

      try {
        if (!USER_UID) {
          throw new Error('USER_UID no está disponible. No se puede añadir transacción.');
        }
        // 1. Añadir la transacción a Firestore
        const docRef = await addDoc(collection(db, `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`), {
          ...transactionData,
          date: Timestamp.fromDate(transactionData.date), // Convertir Date a Firebase Timestamp para Firestore
        });

        // 2. Crear el objeto de transacción con el ID generado por Firestore para el estado local
        const newTransaction: Transaction = { id: docRef.id, ...transactionData, date: transactionData.date }; // Estado local usa Date
        this.transactions.unshift(newTransaction); // Añadir al principio para que las más recientes aparezcan primero

        // 3. Actualizar el saldo de la cuenta asociada
        const account = accountsStore.accounts.find(acc => acc.id === newTransaction.accountId);
        if (account) {
          const newBalance = newTransaction.type === 'Ingreso'
            ? account.balance + newTransaction.amount
            : account.balance - newTransaction.amount;
          await accountsStore.updateAccountBalance(newTransaction.accountId, newBalance);
        } else {
          throw new Error('Cuenta asociada no encontrada al añadir transacción.');
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al añadir transacción:", err);
        throw err; // Relanzar el error para manejo en el componente
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza una transacción existente en Firestore y ajusta el saldo de la cuenta.
     * Maneja cambios en monto, tipo y/o cuenta.
     * @param transactionId ID de la transacción a actualizar.
     * @param transactionData Nuevos datos de la transacción (con 'date' como Date si se modifica).
     */
    async updateTransaction(transactionId: string, transactionData: Partial<Omit<Transaction, 'id' | 'date'>> & { date?: Date }) { // Recibe Date opcional
      this.isLoading = true;
      this.error = null;
      const accountsStore = useAccountsStore();

      try {
        if (!USER_UID) {
          throw new Error('USER_UID no está disponible. No se puede actualizar transacción.');
        }
        // 1. Obtener la transacción antigua para revertir su efecto
        const oldTransaction = this.transactions.find(t => t.id === transactionId);
        if (!oldTransaction) {
          throw new Error('Transacción no encontrada para actualizar.');
        }

        // 2. Revertir el efecto de la transacción antigua en su cuenta original
        const oldAccount = accountsStore.accounts.find(acc => acc.id === oldTransaction.accountId);
        if (oldAccount) {
          // Asegurarse de que oldTransaction.amount es un número
          const oldAmount = typeof oldTransaction.amount === 'number' ? oldTransaction.amount : 0;
          const revertedBalance = oldTransaction.type === 'Ingreso'
            ? oldAccount.balance - oldAmount
            : oldAccount.balance + oldAmount;
          await accountsStore.updateAccountBalance(oldAccount.id, revertedBalance);
        } else {
          console.warn('Cuenta original no encontrada al actualizar transacción. No se pudo revertir el saldo.');
        }

        // 3. Preparar los datos actualizados para Firestore (convertir Date a Timestamp si se proporcionó)
        const transactionRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`, transactionId);
        const updatedFirestoreData: any = { ...transactionData };
        if (transactionData.date) {
          updatedFirestoreData.date = Timestamp.fromDate(transactionData.date); // Convertir Date a Timestamp para Firestore
        }

        // 4. Actualizar la transacción en Firestore
        await updateDoc(transactionRef, updatedFirestoreData);

        // 5. Aplicar el efecto de la transacción actualizada en la cuenta (puede ser la misma o una nueva)
        const targetAccountId = transactionData.accountId || oldTransaction.accountId;
        const newAccount = accountsStore.accounts.find(acc => acc.id === targetAccountId);

        if (newAccount) {
          // Usar el monto y tipo de la transactionData si se proporcionaron, de lo contrario, usar los antiguos
          const effectiveAmount = transactionData.amount !== undefined ? transactionData.amount : oldTransaction.amount;
          const effectiveType = transactionData.type || oldTransaction.type;

          const finalNewBalance = effectiveType === 'Ingreso'
            ? newAccount.balance + effectiveAmount
            : newAccount.balance - effectiveAmount;
          await accountsStore.updateAccountBalance(newAccount.id, finalNewBalance);
        } else {
          throw new Error('Nueva cuenta asociada no encontrada al actualizar transacción.');
        }

        // 6. Actualizar el estado local de Pinia
        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
          // Asegurarse de que la fecha en el estado local sea un Date
          const updatedLocalData: Transaction = {
            ...this.transactions[index], // Mantener campos existentes
            ...transactionData, // Sobrescribir con nuevos datos
            id: transactionId, // Asegurar que el ID esté presente
            date: transactionData.date || (oldTransaction.date instanceof Timestamp ? oldTransaction.date.toDate() : oldTransaction.date as Date), // Asegurar que sea Date
          };
          Object.assign(this.transactions[index], updatedLocalData);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al actualizar transacción:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Elimina una transacción de Firestore y revierte su efecto en el saldo de la cuenta.
     * @param transactionId ID de la transacción a eliminar.
     */
    async deleteTransaction(transactionId: string) {
      this.isLoading = true;
      this.error = null;
      const accountsStore = useAccountsStore();

      try {
        if (!USER_UID) {
          throw new Error('USER_UID no está disponible. No se puede eliminar transacción.');
        }
        // 1. Obtener la transacción a eliminar para revertir su efecto
        const transactionToDelete = this.transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) {
          throw new Error('Transacción no encontrada para eliminar.');
        }

        // 2. Eliminar la transacción de Firestore
        const transactionRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`, transactionId);
        await deleteDoc(transactionRef);
        this.transactions = this.transactions.filter(t => t.id !== transactionId);

        // 3. Revertir el saldo de la cuenta asociada
        const account = accountsStore.accounts.find(acc => acc.id === transactionToDelete.accountId);
        if (account) {
          const revertedBalance = transactionToDelete.type === 'Ingreso'
            ? account.balance - transactionToDelete.amount
            : account.balance + transactionToDelete.amount;
          await accountsStore.updateAccountBalance(account.id, revertedBalance);
        } else {
          console.warn('Cuenta asociada no encontrada al eliminar transacción. No se pudo revertir el saldo.');
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al eliminar transacción:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
