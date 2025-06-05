import { Timestamp } from "firebase/firestore";

// src/types/Transfer.ts
export interface Transfer {
    id: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: Date | Timestamp;
    details?: string;
  }