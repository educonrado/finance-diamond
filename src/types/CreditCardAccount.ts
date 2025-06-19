//src\types\CreditCardAccount.ts
import type { Account } from "./Account";

export interface CreditCardAccount extends Account {
    id: string;
    type: "creditCard";
    creditLimit: number;
    cardType: "Visa" | "MasterCard" | "American Express" | "Discover" | "Other" | undefined;
    billingCycleDay: number;
    paymentDueDay: number; 
}