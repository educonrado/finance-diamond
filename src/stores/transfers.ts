// src/stores/transfers.ts
import { defineStore } from "pinia";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import type { Transfer } from "../types/Transfer";
import {
  USERS_COLLECTION,
  TRANSFERS_COLLECTION,
} from "../constants/firestorePaths";
import { useAuth } from "../composables/useAuth";
import { useAccountsStore } from "./accounts"; // Importa el store de cuentas
import { useCreditCardsStore } from './creditCards'

const { userUid, isInitialized } = useAuth();

// Función de espera para asegurar que el usuario esté autenticado
const waitForAuth = async () => {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (isInitialized.value && userUid.value) {
        resolve();
      } else {
        setTimeout(check, 100); // Espera 100ms y vuelve a verificar
      }
    };
    check();
  });
};

export const useTransfersStore = defineStore("transfers", {
  state: () => ({
    transfers: [] as Transfer[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    /**
     * Carga todas las transferencias del usuario desde Firestore.
     */
    async fetchTransfers() {
      this.isLoading = true;
      this.error = null;

      try {
        await waitForAuth(); // Asegura que el usuario esté autenticado

        const q = query(
          collection(
            db,
            `${USERS_COLLECTION}/${userUid.value}/${TRANSFERS_COLLECTION}`
          ),
          orderBy("date", "desc") // Ordenar por fecha, más reciente primero
        );

        const querySnapshot = await getDocs(q);

        this.transfers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Manejo de la fecha: Firestore Timestamp a Date de JavaScript
          const date =
            data.date && typeof data.date.toDate === "function"
              ? data.date.toDate()
              : new Date(); // Fallback a fecha actual si no es Timestamp

          return {
            id: doc.id,
            fromAccountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            amount: parseFloat(data.amount || 0),
            date: date,
            details: data.details || "",
          } as Transfer;
        });
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al cargar transferencias:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Añade una nueva transferencia y actualiza los saldos de las cuentas.
     * @param transferData Datos de la transferencia (sin id ni fecha)
     */
    async addTransfer(transferData: Omit<Transfer, "id">) {
      this.isLoading = true;
      this.error = null;

      try {
        await waitForAuth();

        const accountsStore = useAccountsStore();
        const creditCardsStore = useCreditCardsStore();

        // Buscar cuentas de origen y destino en ambos stores
        const fromAccount = accountsStore.accounts.find(acc => acc.id === transferData.fromAccountId);
        const toAccount = accountsStore.accounts.find(acc => acc.id === transferData.toAccountId);
        const toCreditCard = creditCardsStore.creditCards.find(card => card.id === transferData.toAccountId);

        // Solo se permite transferir desde cuentas normales
        if (!fromAccount) {
          throw new Error("La cuenta de origen no existe.");
        }
        if (!toAccount && !toCreditCard) {
          throw new Error("La cuenta de destino no existe.");
        }
        if (fromAccount.balance < transferData.amount) {
          throw new Error("Saldo insuficiente en la cuenta de origen.");
        }

        // 1. Guardar la transferencia en Firestore
        const docRef = await addDoc(
          collection(
            db,
            `${USERS_COLLECTION}/${userUid.value}/${TRANSFERS_COLLECTION}`
          ),
          {
            ...transferData,
            amount: parseFloat(transferData.amount.toFixed(2))
          }
        );

        // 2. Actualizar los saldos de las cuentas
        const newFromBalance = parseFloat(
          (fromAccount.balance - transferData.amount).toFixed(2)
        );

        await accountsStore.updateAccountBalance(
          transferData.fromAccountId,
          newFromBalance
        );

        if (toAccount) {
          const newToBalance = parseFloat(
            (toAccount.balance + transferData.amount).toFixed(2)
          );
          await accountsStore.updateAccountBalance(
            transferData.toAccountId,
            newToBalance
          );
        } else if (toCreditCard) {
          // Para tarjetas de crédito, el balance suele ser la deuda acumulada
          await creditCardsStore.updateCreditCard(
            toCreditCard.id,
            { balance: (toCreditCard.balance ?? 0) + transferData.amount }
          );
        }

        // 3. Añadir la transferencia al estado local del store (para que se refleje en la UI)
        // La fecha real se obtiene del servidor, por lo que la simulamos aquí temporalmente
        // o la volvemos a cargar si la precisión es crítica inmediatamente.
        this.transfers.unshift({
          // unshift para añadir al principio y que aparezca primero
          id: docRef.id,
          ...transferData,
        } as Transfer);

        // Opcional: Si necesitas la fecha exacta del servidor inmediatamente,
        // podrías hacer un fetch individual del documento recién creado aquí.
        // await this.fetchTransfers(); // Opcional, recarga todas las transferencias si la inmediatez de la fecha del servidor es crucial.
      } catch (err: any) {
        this.error = err.message;
        console.error("Error al añadir transferencia:", err);
        throw err; // Propaga el error para que la vista lo maneje
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Actualiza una transferencia existente y ajusta los saldos de las cuentas.
     * @param transferId El ID de la transferencia a actualizar.
     * @param updatedData Los datos actualizados de la transferencia.
     */
    async updateTransfer(transferId: string, updatedData: Partial<Omit<Transfer, 'id'>>) {
      this.isLoading = true;
      this.error = null;

      try {
        await waitForAuth();
        const accountsStore = useAccountsStore();

        // Obtener la transferencia original antes de actualizar para calcular las diferencias
        const originalTransfer = this.transfers.find(t => t.id === transferId);
        if (!originalTransfer) {
          throw new Error('Transferencia original no encontrada.');
        }

        // Obtener la referencia al documento en Firestore
        const transferRef = doc(db, `${USERS_COLLECTION}/${userUid.value}/${TRANSFERS_COLLECTION}`, transferId);

        // Convertir la fecha a Date si viene como string (desde el formulario)
        const dateToSave = updatedData.date instanceof Date
          ? updatedData.date
          : (typeof updatedData.date === 'string' ? new Date(updatedData.date) : originalTransfer.date);

        // Asegurar el monto con 2 decimales
        const amountToSave = typeof updatedData.amount === 'number'
          ? parseFloat(updatedData.amount.toFixed(2))
          : originalTransfer.amount;

        // Actualizar la transferencia en Firestore
        await updateDoc(transferRef, {
          ...updatedData,
          date: dateToSave,
          amount: amountToSave
        });

        // --- Lógica para ajustar los saldos de las cuentas ---
        // Deshacer el efecto de la transferencia original
        // Esto implica devolver el dinero a la cuenta de origen original
        // y quitarlo de la cuenta de destino original.
        const originalFromAccount = accountsStore.accounts.find(acc => acc.id === originalTransfer.fromAccountId);
        const originalToAccount = accountsStore.accounts.find(acc => acc.id === originalTransfer.toAccountId);

        if (originalFromAccount) {
          await accountsStore.updateAccountBalance(
            originalTransfer.fromAccountId,
            parseFloat((originalFromAccount.balance + originalTransfer.amount).toFixed(2))
          );
        }
        if (originalToAccount) {
          await accountsStore.updateAccountBalance(
            originalTransfer.toAccountId,
            parseFloat((originalToAccount.balance - originalTransfer.amount).toFixed(2))
          );
        }

        // Aplicar el efecto de la transferencia actualizada
        // Esto implica restar el dinero de la nueva cuenta de origen
        // y sumarlo a la nueva cuenta de destino.
        const newFromAccountId = updatedData.fromAccountId || originalTransfer.fromAccountId;
        const newToAccountId = updatedData.toAccountId || originalTransfer.toAccountId;
        const newAmount = amountToSave;

        const newFromAccount = accountsStore.accounts.find(acc => acc.id === newFromAccountId);
        const newToAccount = accountsStore.accounts.find(acc => acc.id === newToAccountId);

        if (newFromAccount) {
          // Validar saldo suficiente antes de aplicar el nuevo monto
          if (newFromAccount.balance < newAmount && newFromAccountId === originalFromAccount?.id) {
            // Si la cuenta de origen no cambió y el saldo es insuficiente
            // Esto es una validación compleja, podría necesitar refinamiento
            // si se permiten cambios de cuenta de origen.
            // Por simplicidad, si la cuenta de origen es la misma, la validación se hace después de la reversión.
          } else if (newFromAccount.balance < newAmount && newFromAccountId !== originalFromAccount?.id) {
            // Si la cuenta de origen cambió y el saldo es insuficiente en la nueva cuenta
            throw new Error('Saldo insuficiente en la nueva cuenta de origen para la transferencia actualizada.');
          }
          await accountsStore.updateAccountBalance(
            newFromAccountId,
            parseFloat((newFromAccount.balance - newAmount).toFixed(2))
          );
        } else {
          throw new Error('Nueva cuenta de origen no encontrada.');
        }
        if (newToAccount) {
          await accountsStore.updateAccountBalance(
            newToAccountId,
            parseFloat((newToAccount.balance + newAmount).toFixed(2))
          );
        } else {
          throw new Error('Nueva cuenta de destino no encontrada.');
        }

        // Actualizar el estado local del store
        const index = this.transfers.findIndex(t => t.id === transferId);
        if (index !== -1) {
          Object.assign(this.transfers[index], {
            id: transferId, // Aseguramos el ID
            date: dateToSave, // Aseguramos que la fecha sea un objeto Date
            amount: amountToSave,
            ...updatedData
          });
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Error al actualizar transferencia:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Elimina una transferencia y revierte los saldos de las cuentas afectadas.
     * @param transferId El ID de la transferencia a eliminar.
     */
    async deleteTransfer(transferId: string) {
      this.isLoading = true;
      this.error = null;

      try {
        await waitForAuth();
        const accountsStore = useAccountsStore();
        const creditCardsStore = useCreditCardsStore();

        // Obtener la transferencia antes de eliminar para revertir los saldos
        const transferToDelete = this.transfers.find(t => t.id === transferId);
        if (!transferToDelete) {
          throw new Error('Transferencia no encontrada para eliminar.');
        }

        // Eliminar la transferencia de Firestore
        const transferRef = doc(db, `${USERS_COLLECTION}/${userUid.value}/${TRANSFERS_COLLECTION}`, transferId);
        await deleteDoc(transferRef);

        // Revertir los saldos de las cuentas afectadas
        // Origen siempre es cuenta normal
        const fromAccount = accountsStore.accounts.find(acc => acc.id === transferToDelete.fromAccountId);
        if (fromAccount) {
          await accountsStore.updateAccountBalance(
            transferToDelete.fromAccountId,
            parseFloat((fromAccount.balance + transferToDelete.amount).toFixed(2))
          );
        }

        // Destino puede ser cuenta normal o tarjeta
        const toAccount = accountsStore.accounts.find(acc => acc.id === transferToDelete.toAccountId);
        const toCreditCard = creditCardsStore.creditCards.find(card => card.id === transferToDelete.toAccountId);

        if (toAccount) {
          await accountsStore.updateAccountBalance(
            transferToDelete.toAccountId,
            parseFloat((toAccount.balance - transferToDelete.amount).toFixed(2))
          );
        } else if (toCreditCard) {
          await creditCardsStore.updateCreditCard(
            toCreditCard.id,
            { balance: (toCreditCard.balance ?? 0) - transferToDelete.amount }
          );
        }

        // Eliminar la transferencia del estado local del store
        this.transfers = this.transfers.filter(t => t.id !== transferId);
      } catch (err: any) {
        this.error = err.message;
        console.error('Error al eliminar transferencia:', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
