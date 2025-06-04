export interface Account {
  id: string;
  name: string;
  initialBalance: number; // Saldo inicial al crear la cuenta
  balance: number; // Saldo actual, se actualiza con las transacciones
}