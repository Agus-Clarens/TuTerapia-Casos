// Mapea el email de cada usuario a los sectores de casos que le competen.
// Un caso "Admin+Talent" le aparece tanto a quien ve Admin como a quien ve Talent.
// Los directores (o cualquiera no listado) ven todos los sectores.

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

// Devuelve los sectores que le competen a un email, o null si ve todos.
export function sectoresDeUsuario(email: string): string[] | null {
  if (!email) return null
  return MAPA[email.toLowerCase()] || null
}

// Decide si un caso le compete a un usuario segun su area.
// area del caso puede ser 'CX', 'Admin', 'Talent', 'Admin+Talent', 'Business'.
export function casoCompeteAUsuario(email: string, areaCaso: string): boolean {
  const sectores = sectoresDeUsuario(email)
  if (!sectores) return true // directores / no listados ven todos
  if (!areaCaso) return false
  // Admin+Talent le compete a quien vea Admin o Talent
  return sectores.some(s => areaCaso === s || areaCaso.includes(s))
}
