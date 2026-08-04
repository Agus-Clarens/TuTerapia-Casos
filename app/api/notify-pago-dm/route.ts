import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, nro_solicitud, tipo, monto, moneda, motivo } = await req.json()
    const token = process.env.SLACK_BOT_TOKEN
    if (!token || !email) return NextResponse.json({ ok: false, error: 'faltan datos' })

    // 1. Buscar el usuario de Slack por su mail
    const lookupRes = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const lookup = await lookupRes.json()
    if (!lookup.ok) return NextResponse.json({ ok: false, error: 'usuario no encontrado en Slack: ' + lookup.error })

    const userId = lookup.user.id

    // 2. Abrir (o reusar) el DM con ese usuario
    const openRes = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: userId }),
    })
    const open = await openRes.json()
    if (!open.ok) return NextResponse.json({ ok: false, error: 'no se pudo abrir el DM: ' + open.error })

    const channelId = open.channel.id

    // 3. Mandar el mensaje
    const mensaje = `✅ *¡Tu solicitud de pago ${nro_solicitud} ya fue pagada!*\n*Tipo:* ${tipo}\n*Monto:* ${moneda} ${monto}\n*Motivo:* ${motivo}\n\n🔗 <https://tuterapia-casos.vercel.app/pagos/mis-solicitudes|Ver mis solicitudes>`

    const sendRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: channelId, attachments: [{ color: '#22C55E', text: mensaje }] }),
    })
    const send = await sendRes.json()
    if (!send.ok) return NextResponse.json({ ok: false, error: 'no se pudo enviar: ' + send.error })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}
