import { sendPurchaseReceipt } from './mail.js'
import { getStripeOrder, orderFromSession, patchStripeOrder } from './stripe-orders.js'

export async function fulfillPaidSession(session) {
  const found = session?.id
    ? session.line_items
      ? { session, order: orderFromSession(session) }
      : await getStripeOrder(session.id)
    : null
  if (!found?.order || found.session.payment_status !== 'paid') return found?.order ?? null

  const statusPatch = found.order.status === 'awaiting_payment' ? { wap_status: 'paid' } : {}
  if (!found.order.receipt_sent) {
    await sendPurchaseReceipt({
      confirmation_number: found.order.confirmation_number,
      customer_name: found.order.customer_name,
      customer_email: found.order.customer_email,
      lines: found.order.wap_order_items,
      total_cents: found.order.total_cents,
      ship_to: found.order.ship_to,
      idempotencyKey: `wap-receipt-${found.session.id}`,
    })
    await patchStripeOrder(found.session.id, { receipt_sent: '1', ...statusPatch })
    return (await getStripeOrder(found.session.id))?.order ?? found.order
  }

  if (statusPatch.wap_status) {
    await patchStripeOrder(found.session.id, statusPatch)
    return (await getStripeOrder(found.session.id))?.order ?? found.order
  }

  return found.order
}
