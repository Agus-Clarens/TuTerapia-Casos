// Mapea el email de cada usuario a los sectores de casos que le competen.
const MAPA: Record<string, string[]> = {
  'info@tuterapia.com.ar': ['CX'],
  'marketing@tuterapia.com.uy': ['CX'],
  'aclarens@tuterapia.com.ar': ['Admin'],
  'admin@tuterapia.com.ar': ['Admin'],
  'people@tuterapia.com.uy': ['Talent'],
  'talent@tuterapia.com.ar': ['Talent'],
  'talent@tuterapia.com.uy': ['Talent'],
  'cbarros@tuterapia.com.uy': ['Talent'],
  'firoldi@tuterapia.com.uy': ['Business'],
  'imazzilli@tuterapia.com.uy': ['Business'],
}

export function sectoresDeUsuario(email: string): string[] | null {
  if (!email) return null
  return MAPA[email.toLowerCase()] || null
}

// Mapea el email del usuario al nombre con que figura como 'autor' en el hilo.
const EMAIL_A_NOMBRE: Record<string, string> = {
  'info@tuterapia.com.ar': 'Sol CX',
  'aclarens@tuterapia.com.ar': 'Agus Admin',
  'admin@tuterapia.com.ar': 'Sofi Admin',
  'talent@tuterapia.com.ar': 'Orne Talent',
  'talent@tuterapia.com.uy': 'Orne Talent',
  'cbarros@tuterapia.com.uy': 'Caro Talent',
  'people@tuterapia.com.uy': 'Belu Talent',
  'firoldi@tuterapia.com.uy': 'Flor Business',
  'imazzilli@tuterapia.com.uy': 'Ismael Business',
  'marketing@tuterapia.com.uy': 'Jose Marketing',
  'nicolasbrupbacher@gmail.com': 'Nico Director',
  'jdelgado@tuterapia.com.uy': 'Nacho Director',
}

export function nombreDeUsuario(email: string): string | null {
  if (!email) return null
  return EMAIL_A_NOMBRE[email.toLowerCase()] || null
}

export function casoCompeteAUsuario(email: string, areaCaso: string): boolean {
  const sectores = sectoresDeUsuario(email)
  if (!sectores) return true
  if (!areaCaso) return false
  return sectores.some(s => areaCaso === s || areaCaso.includes(s))
}

// Devuelve true si el sector del usuario YA cerró su parte de este caso.
// Si el usuario ve todos (director) nunca se considera "cerrado para él".
export function sectorDelUsuarioCerrado(email: string, caso: any): boolean {
  const sectores = sectoresDeUsuario(email)
  if (!sectores) return false // directores / no listados: nunca se les corta
  // Un caso puede tocar varios sectores del usuario (raro), basta que TODOS los suyos esten cerrados
  const relevantes = sectores.filter(s => caso.area === s || (caso.area || '').includes(s))
  if (relevantes.length === 0) return false
  return relevantes.every(s => {
    if (s === 'Admin') return caso.estado_admin === 'Cerrado'
    if (s === 'Talent') return caso.estado_talent === 'Cerrado'
    if (s === 'CX') return caso.estado_cx === 'Cerrado'
    if (s === 'Business') return caso.estado_business === 'Cerrado'
    return false
  })
}
