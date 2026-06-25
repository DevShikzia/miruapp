import cron from 'node-cron'
import { RecurringBillModel } from '../models/RecurringBill.model'
import { FamilyModel } from '../models/Family.model'
import { NotificationModel } from '../models/Notification.model'
import { logger, PREFIXES } from '../utils/logger'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function startCronJobs(): void {
  cron.schedule('0 8 * * *', async () => {
    logger.info(PREFIXES.CRON, 'Verificando gastos recurrentes...')
    const today = new Date().toISOString().slice(0, 10)
    const bills = await RecurringBillModel.find({ isActive: true, nextDueDate: today })

    for (const bill of bills) {
      const family = await FamilyModel.findById(bill.familyId)
      if (!family) continue

      for (const member of family.members) {
        if (!member.acceptedAt) continue
        await NotificationModel.create({
          userId: member.userId,
          type: 'reminder',
          title: 'Vence hoy',
          body: `Hoy vence ${bill.name} — $${bill.amount.toLocaleString('es-AR')}`,
          data: { billId: bill._id.toString(), amount: bill.amount },
        })
      }

      let nextDate: string
      switch (bill.frequency) {
        case 'weekly': nextDate = addDays(bill.nextDueDate, 7); break
        case 'biweekly': nextDate = addDays(bill.nextDueDate, 14); break
        case 'monthly': nextDate = addDays(bill.nextDueDate, 30); break
        case 'quarterly': nextDate = addDays(bill.nextDueDate, 90); break
        case 'yearly': nextDate = addDays(bill.nextDueDate, 365); break
        default: nextDate = addDays(bill.nextDueDate, 30)
      }
      await RecurringBillModel.findByIdAndUpdate(bill._id, { nextDueDate: nextDate })
    }
  })

  logger.info(PREFIXES.CRON, 'Jobs iniciados')
}
