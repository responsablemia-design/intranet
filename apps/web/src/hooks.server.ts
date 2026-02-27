import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // Usuario fake para demos (bypass completo)
  event.locals.user = {
    id: 'demo-user-1',
    email: 'demo@iesfelixdeazara.com',
    name: 'Usuario Demo',
    avatar: null,
    role: 'ADMIN'
  }

  return resolve(event)
}