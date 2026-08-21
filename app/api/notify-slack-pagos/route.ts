import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { nro_solicitud, tipo, solicitante, destinatario, monto, moneda, motivo } = await req.json()

    const webhook = process.env.SLACK_WEBHOOK_URL_ADMINISTRACION
    if (!webhook) return NextResponse.json({ ok: false, error: 'no webhook' })

    const emojiTipo = tipo === 'Reembolso' ? '🧾' : tipo === 'Factura equipo interno' ? '📄' : tipo === 'Facturas a proveedores' ? '🗂️' : '💸'
    const esArchivar = tipo === 'Facturas a proveedores'
    const mensaje = esArchivar
      ? `${emojiTipo} *Facturas a archivar ${nro_solicitud}*\n*Enviado por:* ${solicitante}\n*Proveedor:* ${destinatario}\n*Descripción:* ${motivo}\n\n🔗 <https://tuterapia-casos.vercel.app/pagos/bandeja|Ver bandeja de pagos>`
      : `${emojiTipo} *Nueva solicitud de pago ${nro_solicitud}*\n*Tipo:* ${tipo}\n*Solicita:* ${solicitante}\n*Pagar a:* ${destinatario}\n*Monto:* ${moneda} ${monto}\n*Motivo:* ${motivo}\n\n🔗 <https://tuterapia-casos.vercel.app/pagos/bandeja|Ver bandeja de pagos>`

    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attachments: [{ color: '#264534', text: mensaje }] }),
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}
