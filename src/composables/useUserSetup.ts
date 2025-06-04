// src/composables/useUserSetup.ts
import { ref } from 'vue';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { Category } from '../types/Category';
import type { Account } from '../types/Account'; // Importa la interfaz de Cuenta actualizada
import { USERS_COLLECTION, CATEGORIES_COLLECTION, ACCOUNTS_COLLECTION } from '../constants/firestorePaths'; // Importa las constantes de rutas

// Asumimos un user-uid quemado por ahora, lo reemplazarás con el real de Firebase Auth
export const USER_UID = 'user-uid'; // Exportamos para que otros componentes puedan usarlo

// Categorías por defecto
const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Ingresos
  { name: 'Salario', type: 'Ingreso', icon: '💰' },
  { name: 'Inversiones', type: 'Ingreso', icon: '📈' },
  { name: 'Regalo', type: 'Ingreso', icon: '🎁' },
  { name: 'Ventas', type: 'Ingreso', icon: '🛒' },
  { name: 'Otros Ingresos', type: 'Ingreso', icon: '➕' },

  // Gastos
  { name: 'Alimentación', type: 'Gasto', icon: '🍔' },
  { name: 'Transporte', type: 'Gasto', icon: '🚌' },
  { name: 'Vivienda', type: 'Gasto', icon: '🏠' },
  { name: 'Entretenimiento', type: 'Gasto', icon: '🎉' },
  { name: 'Salud', type: 'Gasto', icon: '🏥' },
  { name: 'Educación', type: 'Gasto', icon: '📚' },
  { name: 'Ropa', type: 'Gasto', icon: '👕' },
  { name: 'Servicios', type: 'Gasto', icon: '💡' },
  { name: 'Deudas', type: 'Gasto', icon: '💳' },
  { name: 'Otros Gastos', type: 'Gasto', icon: '➖' },
];

// Cuentas por defecto (ahora sin 'type')
const DEFAULT_ACCOUNTS: Omit<Account, 'id'>[] = [
  { name: 'Efectivo', initialBalance: 0, balance: 0 },
  { name: 'Cuenta de Ahorros', initialBalance: 0, balance: 0 },
  { name: 'Tarjeta de Crédito', initialBalance: 0, balance: 0 },
];

export function useUserSetup() {
  const isLoadingSetup = ref(false);
  const errorSetup = ref<string | null>(null);

  const setupUserCollections = async (userUid: string) => {
    isLoadingSetup.value = true;
    errorSetup.value = null;

    try {
      const userDocRef = doc(db, USERS_COLLECTION, userUid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log(`Inicializando colecciones para el nuevo usuario: ${userUid}`);

        await setDoc(userDocRef, {
            createdAt: new Date(),
        });

        // Crear subcolección de categorías
        const categoriesBatch = [];
        for (const category of DEFAULT_CATEGORIES) {
          const categoryDocRef = doc(db, USERS_COLLECTION, userUid, CATEGORIES_COLLECTION, category.name);
          categoriesBatch.push(setDoc(categoryDocRef, category));
        }
        await Promise.all(categoriesBatch);
        console.log('Categorías por defecto cargadas.');

        // Crear subcolección de cuentas
        const accountsBatch = [];
        for (const account of DEFAULT_ACCOUNTS) {
          // Usamos el nombre como ID para la cuenta por defecto
          const accountDocRef = doc(db, USERS_COLLECTION, userUid, ACCOUNTS_COLLECTION, account.name); 
          accountsBatch.push(setDoc(accountDocRef, account));
        }
        await Promise.all(accountsBatch);
        console.log('Cuentas por defecto cargadas.');

      } else {
        console.log(`Colecciones del usuario ${userUid} ya existen.`);
      }
    } catch (error: any) {
      console.error('Error al configurar colecciones del usuario:', error);
      errorSetup.value = `Error al inicializar datos del usuario: ${error.message}`;
    } finally {
      isLoadingSetup.value = false;
    }
  };

  return {
    isLoadingSetup,
    errorSetup,
    setupUserCollections,
    USER_UID, // Exportamos el UID quemado para que otros componentes puedan usarlo
  };
}
