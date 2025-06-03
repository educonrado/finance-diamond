export interface Account {
  id: string;
  name: string;
  type: string; 
  initialBalance: number; // Saldo inicial al crear la cuenta
  balance: number; // Saldo actual, se actualiza con las transacciones
}