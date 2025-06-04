// src/stores/accounts.ts
import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'; // Importa orderBy
import type { Account } from '../types/Account';
import { USERS_COLLECTION, ACCOUNTS_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths';
import { USER_UID } from '../composables/useUserSetup';

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Account[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    /**
     * Carga las cuentas del usuario desde Firestore.
     */
    async fetchAccounts() {
      this.isLoading = true;
      this.error = null;
      try {
        if (!USER_UID) {
          console.warn('USER_UID no está disponible. No se pueden cargar cuentas.');
          this.isLoading = false;
          return;
        }
        // MODIFICADO: Añadido orderBy('name', 'asc')
        const q = query(collection(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        this.accounts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            initialBalance: parseFloat(data.initialBalance || 0),
            balance: parseFloat(data.balance || 0),
            color: data.color
          } as Account;
        });
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al cargar cuentas:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Añade una nueva cuenta a Firestore.
     * @param accountData Datos de la nueva cuenta (sin 'id', pero incluyendo 'name', 'type', 'initialBalance').
     */
    async addAccount(accountData: Omit<Account, 'id' | 'balance'>) {
      this.isLoading = true;
      this.error = null;
      try {
        if (!USER_UID) {
          throw new Error('USER_UID no está disponible. No se puede añadir cuenta.');
        }
        // ASEGURAR que el balance inicial sea un número al guardar
        const initialBalanceAsNumber = parseFloat(accountData.initialBalance.toString());
        const docRef = await addDoc(collection(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`), {
          ...accountData,
          balance: initialBalanceAsNumber, // El saldo actual inicia igual que el saldo inicial
        });
        // Añade la nueva cuenta al estado local de Pinia
        this.accounts.push({ id: docRef.id, ...accountData, balance: initialBalanceAsNumber });
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al añadir cuenta:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza una cuenta existente en Firestore.
     * @param accountId ID de la cuenta a actualizar.
     * @param accountData Nuevos datos de la cuenta (Partial<Omit<Account, 'id'>>).
     * Nota: Si se actualiza initialBalance, también se ajusta el balance actual.
     */
    async updateAccount(accountId: string, accountData: Partial<Omit<Account, 'id'>>) {
      this.isLoading = true;
      this.error = null;
      try {
        if (!USER_UID) {
          throw new Error('USER_UID no está disponible. No se puede actualizar cuenta.');
        }
        const accountRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`, accountId);
        
        // Si se está actualizando el initialBalance, necesitamos recalcular el balance actual
        if (accountData.initialBalance !== undefined) {
          const currentAccount = this.accounts.find(acc => acc.id === accountId);
          if (currentAccount) {
            // ASEGURAR que ambos saldos sean números para el cálculo
            const oldInitialBalance = parseFloat(currentAccount.initialBalance.toString());
            const newInitialBalance = parseFloat(accountData.initialBalance.toString());
            const balanceDifference = newInitialBalance - oldInitialBalance;
            // Ajustar el balance actual por esa diferencia y asegurar 2 decimales
            accountData.balance = parseFloat((currentAccount.balance + balanceDifference).toFixed(2));
          }
        }

        await updateDoc(accountRef, accountData);
        const index = this.accounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
          Object.assign(this.accounts[index], accountData);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al actualizar cuenta:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Elimina una cuenta de Firestore.
     * @param accountId ID de la cuenta a eliminar.
     */
    async deleteAccount(accountId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        if (!USER_UID) {
          throw new Error('USER_UID no está disponible. No se puede eliminar cuenta.');
        }
        // Verificar si la cuenta está en uso por alguna transacción
        const q = query(collection(db, `${USERS_COLLECTION}/${USER_UID}/${TRANSACTIONS_COLLECTION}`), where('accountId', '==', accountId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error('No se puede eliminar la cuenta porque tiene transacciones asociadas.');
        }

        const accountRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`, accountId);
        await deleteDoc(accountRef);
        this.accounts = this.accounts.filter(acc => acc.id !== accountId);
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al eliminar cuenta:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza el saldo actual de una cuenta en Firestore y en el estado local.
     * @param accountId ID de la cuenta a actualizar.
     * @param newBalance Nuevo saldo.
     */
    async updateAccountBalance(accountId: string, newBalance: number) {
      try {
        if (!USER_UID) {
          console.warn('USER_UID no está disponible. No se puede actualizar el saldo de la cuenta.');
          return;
        }
        const accountRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`, accountId);
        // Asegurar que newBalance sea un número antes de actualizar
        const balanceToUpdate = parseFloat(newBalance.toFixed(2)); // Asegura 2 decimales y es número
        await updateDoc(accountRef, { balance: balanceToUpdate });
        const index = this.accounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
          this.accounts[index].balance = balanceToUpdate;
          console.log(`Balance for account ${this.accounts[index].name} (${accountId}) updated to: ${balanceToUpdate}`);
        }
      } catch (err: any) {
        console.error("Error al actualizar saldo de cuenta:", err);
      }
    }
  },
});
