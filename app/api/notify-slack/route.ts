import { NextResponse } from 'next/server'

// Tipos que cruzan CX ↔ Business
const TIPOS_CRUZADOS_CX_BUSINESS = ['Problemas con el cupon', 'Contacto con la empresa']

export async function POST(req: Request) {
  try {
    const { nro_caso, area, tipo_caso, pac_nombre, cargado_por, pais } = await req.json()

    // Elegir el webhook según el caso:
    //  - Business o tipo cruzado CX↔Business → canal cx-business
    //  - Todo lo demás → canal general cx-admin-talent
    const esCxBusiness = area === 'Business' || TIPOS_CRUZADOS_CX_BUSINESS.includes(tipo_caso)
    const webhook = esCxBusiness
      ? (process.env.SLACK_WEBHOOK_URL_CX_BUSINESS || process.env.SLACK_WEBHOOK_URL)
      : process.env.SLACK_WEBHOOK_URL

    if (!webhook) return NextResponse.json({ ok: false, error: 'no webhook' })

    const mensaje = `🎫 *Nuevo caso ${nro_caso}*\n*Área asignada:* ${area}\n*Tipo:* ${tipo_caso}\n*Paciente:* ${pac_nombre}\n*País:* ${pais}\n*Cargado por:* ${cargado_por}\n\n🔗 <https://tuterapia-casos.vercel.app/casos|Ver casos>`

    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: mensaje })
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false })
  }
}
