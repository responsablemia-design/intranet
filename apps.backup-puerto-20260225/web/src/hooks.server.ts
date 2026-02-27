import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // Cargar usuario desde la API en cada petición
  try {
    const apiUrl = process.env.PUBLIC_API_URL ?? 'http://api:3000'
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { cookie: event.request.headers.get('cookie') ?? '' },
    })

    if (res.ok) {
      event.locals.user = await res.json()
    } else {
      event.locals.user = null
    }
  } catch {
    event.locals.user = null
  }

  return resolve(event)
}
