import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import type { Loan, LoanPayment } from '../types/Loan';
import { USERS_COLLECTION, LOANS_COLLECTION } from '../constants/firestorePaths';
import { useAuth } from '@/composables/useAuth';

const { userUid, isInitialized } = useAuth();
const waitForAuth = async () => new Promise<void>((resolve) => {
  const check = () => {
    if (isInitialized.value && userUid.value) resolve();
    else setTimeout(check, 100);
  };
  check();
});

export const useLoansStore = defineStore('loans', {
  state: () => ({
    loans: [] as Loan[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchLoans() {
      this.isLoading = true;
      this.error = null;
      try {
        await waitForAuth();
        const q = query(collection(db, `${USERS_COLLECTION}/${userUid.value}/${LOANS_COLLECTION}`), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        this.loans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Loan[];
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    async addLoan(loan: Omit<Loan, 'id' | 'status' | 'order' | 'payments' | 'remaining'>) {
      this.isLoading = true;
      this.error = null;
      try {
        await waitForAuth();
        const order = Date.now();
        const docRef = await addDoc(collection(db, `${USERS_COLLECTION}/${userUid.value}/${LOANS_COLLECTION}`), {
          ...loan,
          status: 'Activo',
          order,
          remaining: loan.amount,
          payments: [],
        });
        this.loans.push({ id: docRef.id, ...loan, status: 'Activo', order, remaining: loan.amount, payments: [] });
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    async addPayment(loanId: string, payment: Omit<LoanPayment, 'id' | 'loanId'>) {
      this.isLoading = true;
      this.error = null;
      try {
        await waitForAuth();
        const loanDoc = doc(db, `${USERS_COLLECTION}/${userUid.value}/${LOANS_COLLECTION}`, loanId);
        // Fetch loan
        const loan = this.loans.find(l => l.id === loanId);
        if (!loan) throw new Error('Préstamo no encontrado');
        const newRemaining = loan.remaining - payment.amount;
        const newPayment = { ...payment, id: Date.now().toString(), loanId };
        const newPayments = [...loan.payments, newPayment];
        let newStatus: 'Activo' | 'Pagado' | 'Condonado' = 'Activo';
        if (newRemaining <= 0) newStatus = 'Pagado';
        await updateDoc(loanDoc, { payments: newPayments, remaining: newRemaining, status: newStatus });
        Object.assign(loan, { payments: newPayments, remaining: newRemaining, status: newStatus });
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    async forgiveLoan(loanId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await waitForAuth();
        const loanDoc = doc(db, `${USERS_COLLECTION}/${userUid.value}/${LOANS_COLLECTION}`, loanId);
        await updateDoc(loanDoc, { status: 'Condonado' });
        const loan = this.loans.find(l => l.id === loanId);
        if (loan) loan.status = 'Condonado';
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteLoan(loanId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        await waitForAuth();
        const loanDoc = doc(db, `${USERS_COLLECTION}/${userUid.value}/${LOANS_COLLECTION}`, loanId);
        await deleteDoc(loanDoc);
        this.loans = this.loans.filter(l => l.id !== loanId);
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
