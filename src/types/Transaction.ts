import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;
  date: Date | Timestamp;
  description: string;
  categoryId: string;
  accountId: string;
  amount: number;
  type: "Ingreso" | "Gasto";
  details?: string;
}
