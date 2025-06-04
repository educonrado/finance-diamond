// src/stores/accounts.ts
import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Account } from '../types/Account'; // Importa la interfaz de Cuenta actualizada
import { USERS_COLLECTION, ACCOUNTS_COLLECTION, TRANSACTIONS_COLLECTION } from '../constants/firestorePaths'; // Importa las constantes de rutas

// Asumimos un user-uid quemado por ahora
const USER_UID = 'user-uid';

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
        const q = collection(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`);
        const querySnapshot = await getDocs(q);
        this.accounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al cargar cuentas:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Añade una nueva cuenta a Firestore.
     * @param accountData Datos de la nueva cuenta (sin 'id', sin 'type').
     */
    async addAccount(accountData: Omit<Account, 'id' | 'balance'>) {
      this.isLoading = true;
      this.error = null;
      try {
        const docRef = await addDoc(collection(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`), {
          name: accountData.name, // Solo nombre
          initialBalance: accountData.initialBalance,
          balance: accountData.initialBalance, // El saldo actual inicia igual que el saldo inicial
        });
        // Añade la nueva cuenta al estado local de Pinia
        this.accounts.push({ id: docRef.id, name: accountData.name, initialBalance: accountData.initialBalance, balance: accountData.initialBalance });
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
        const accountRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`, accountId);
        
        // Si se está actualizando el initialBalance, necesitamos recalcular el balance actual
        if (accountData.initialBalance !== undefined) {
          const currentAccount = this.accounts.find(acc => acc.id === accountId);
          if (currentAccount) {
            // Diferencia entre el nuevo initialBalance y el viejo
            const balanceDifference = accountData.initialBalance - currentAccount.initialBalance;
            // Ajustar el balance actual por esa diferencia
            accountData.balance = currentAccount.balance + balanceDifference;
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
        const accountRef = doc(db, `${USERS_COLLECTION}/${USER_UID}/${ACCOUNTS_COLLECTION}`, accountId);
        await updateDoc(accountRef, { balance: newBalance });
        const index = this.accounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
          this.accounts[index].balance = newBalance;
        }
      } catch (err: any) {
        console.error("Error al actualizar saldo de cuenta:", err);
        // No lanzar error aquí, ya que esta acción es interna.
      }
    }
  },
});
