import type { Transaction } from '@/types/Transaction'
import { isSameMonth, isSameYear, parseISO } from 'date-fns'

export function getMonthlyIncomeAndExpenses(
  transactions: Transaction[],
  month: number,
  year: number
): { income: number; expenses: number } {
  let income = 0
  let expenses = 0

  transactions.forEach((t) => {
    const date =
      t.date instanceof Date
        ? t.date
        : typeof t.date === 'string'
        ? parseISO(t.date)
        : t.date.toDate()

    if (isSameMonth(date, new Date(year, month - 1, 1)) && isSameYear(date, new Date(year, month - 1, 1))) {
      if (t.type === 'Ingreso') {
        income += t.amount
      } else if (t.type === 'Gasto') {
        expenses += t.amount
      }
    }
  })

  return {
    income,
    expenses,
  }
}
