import { Resend } from 'resend'

const BRAND = 'West African Produce'
const STAFF_INBOX = process.env.WAP_STAFF_EMAIL || 'dan@baglini.co'

function dollars(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100)
}

function resend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

function fromAddress() {
  return process.env.RESEND_FROM || `${BRAND} <dan@baglini.co>`
}

function lineRows(lines) {
  return (lines ?? [])
    .map(
      (line) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8dfcf;">${line.quantity} × ${escapeHtml(line.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8dfcf;text-align:right;">${dollars(line.unit_price_cents * line.quantity)}</td>
        </tr>`,
    )
    .join('')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function shipBlock(shipTo) {
  if (!shipTo) return ''
  const lines = [shipTo.name, shipTo.line1, shipTo.line2, [shipTo.city, shipTo.state, shipTo.postal_code].filter(Boolean).join(', ')]
    .filter(Boolean)
    .map(escapeHtml)
  return `<p style="margin:16px 0 0;font-size:14px;line-height:1.5;"><strong>Ship to</strong><br/>${lines.join('<br/>')}</p>`
}

function receiptHtml({ confirmationNumber, customerName, lines, totalCents, shipTo }) {
  return `<!doctype html>
<html>
<body style="margin:0;background:#f7f1e4;font-family:Georgia,serif;color:#1f1610;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#9c2e12;">${BRAND}</p>
    <h1 style="margin:12px 0 8px;font-size:28px;">Payment received.</h1>
    <p style="margin:0 0 24px;font-size:16px;">Thanks${customerName ? `, ${escapeHtml(customerName)}` : ''}. Your confirmation number is <strong>${escapeHtml(confirmationNumber)}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">${lineRows(lines)}</table>
    <p style="margin:16px 0 0;font-size:18px;"><strong>Total ${dollars(totalCents)}</strong></p>
    ${shipBlock(shipTo)}
    <p style="margin:28px 0 0;font-size:13px;color:#6b5e4e;">This is a test-mode receipt for the West African Produce storefront. Questions: ${STAFF_INBOX}.</p>
  </div>
</body>
</html>`
}

export async function sendPurchaseReceipt(order) {
  const client = resend()
  if (!client || !order?.customer_email) return { skipped: true }

  const html = receiptHtml({
    confirmationNumber: order.confirmation_number,
    customerName: order.customer_name,
    lines: order.lines,
    totalCents: order.total_cents,
    shipTo: order.ship_to,
  })

  const { error } = await client.emails.send(
    {
      from: fromAddress(),
      to: order.customer_email,
      bcc: STAFF_INBOX,
      subject: `Receipt ${order.confirmation_number} · ${BRAND}`,
      html,
    },
    order.idempotencyKey ? { idempotencyKey: order.idempotencyKey } : undefined,
  )
  if (error) throw new Error(error.message || 'Resend could not send the receipt.')
  return { sent: true }
}
