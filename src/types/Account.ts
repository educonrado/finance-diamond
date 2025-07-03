// src/types/Account.ts
export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  balance: number;
  color: string;
  order?: number;
  includeInTotal?: boolean;
}