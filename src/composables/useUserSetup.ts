// src/composables/useUserSetup.ts
import { ref } from 'vue';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { Category } from '../types/Category';
import type { Account } from '../types/Account';
import { USERS_COLLECTION, CATEGORIES_COLLECTION, ACCOUNTS_COLLECTION } from '../constants/firestorePaths';

// Categorías por defecto
const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Ingresos
  { name: 'Arriendos', type: 'Ingreso', icon: '🏠' },
  { name: 'Bonos', type: 'Ingreso', icon: '🎯' },
  { name: 'Cobro de préstamos', type: 'Ingreso', icon: '↪️' },
  { name: 'Comisiones', type: 'Ingreso', icon: '💼' },
  { name: 'Encargos', type: 'Ingreso', icon: '⚓' },
  { name: 'Fondos de reserva', type: 'Ingreso', icon: '🛡️' },
  { name: 'Interés', type: 'Ingreso', icon: '📊' },
  { name: 'Préstamos', type: 'Ingreso', icon: '↩️' },
  { name: 'Regalos', type: 'Ingreso', icon: '🎁' },
  { name: 'Sueldo', type: 'Ingreso', icon: '💰' },
  { name: 'Ventas', type: 'Ingreso', icon: '🛒' },
  // Gastos
  { name: 'Ahorro', type: 'Gasto', icon: '💰' }, 
  { name: 'Alimentación', type: 'Gasto', icon: '🍔' },
  { name: 'Contribución', type: 'Gasto', icon: '🤝' },
  { name: 'Costos bancarios', type: 'Gasto', icon: '🏦' },
  { name: 'Cursos', type: 'Gasto', icon: '🎓' },
  { name: 'Educación', type: 'Gasto', icon: '📚' },
  { name: 'Entretenimiento', type: 'Gasto', icon: '🎬' },
  { name: 'Vestimenta', type: 'Gasto', icon: '👗' }, 
  { name: 'Gastos personales', type: 'Gasto', icon: '🧴' }, 
  { name: 'Otros', type: 'Gasto', icon: '📦' }, 
  { name: 'Salud', type: 'Gasto', icon: '🏥' },
  { name: 'Tarjeta de crédito', type: 'Gasto', icon: '💳' },
  { name: 'Transporte', type: 'Gasto', icon: '🚗' },
  { name: 'Vivienda', type: 'Gasto', icon: '🏠' }
];

const DEFAULT_ACCOUNT_COLORS = [
  '#60A5FA',
  '#34D399',
  '#FCD34D',
  '#FB7185',
  '#A78BFA',
  '#F472B6',
];

export const DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'balance'>[] = [
  { name: 'Efectivo', initialBalance: 0, color: DEFAULT_ACCOUNT_COLORS[0], order: 0, includeInTotal: true },
  { name: 'Cuenta de Ahorros', initialBalance: 0, color: DEFAULT_ACCOUNT_COLORS[1], order: 1, includeInTotal: true  },
  { name: 'Inversiones', initialBalance: 0, color: DEFAULT_ACCOUNT_COLORS[2], order: 2, includeInTotal: true  },
  { name: 'Fondo de Emergencia', initialBalance: 0, color: DEFAULT_ACCOUNT_COLORS[3], order: 3, includeInTotal: true  },
];

export const useUserSetup = () => {
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
        
        // Crear documento del usuario
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
        
        console.log(`✅ Usuario ${userUid} configurado exitosamente`);
      } else {
        console.log(`Usuario ${userUid} ya existe - omitiendo configuración inicial`);
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
    setupUserCollections
  };
};