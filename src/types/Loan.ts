export type LoanStatus = 'Activo' | 'Pagado' | 'Condonado';

export interface Loan {
  id: string;
  borrower: string;
  amount: number;
  remaining: number;
  originAccountId: string;
  date: Date;
  dueDate?: Date;
  details?: string;
  status: LoanStatus;
  order: number;
  payments: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  accountId: string;
  date: Date;
  details?: string;
}
