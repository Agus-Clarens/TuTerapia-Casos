// Mapea el email de cada usuario a los sectores de casos que le competen.
const MAPA: Record<string, string[]> = {
  'info@tuterapia.com.ar': ['CX'],
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
