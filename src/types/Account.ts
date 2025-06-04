// src/types/Account.ts
export interface Account {
  id: string; // ID único de Firestore
  name: string;
  initialBalance: number; // Saldo inicial al crear la cuenta
  balance: number; // Saldo actual, se actualiza con las transacciones
  color: string; // Nuevo: Color asociado a la cuenta (ej. código HEX)
}