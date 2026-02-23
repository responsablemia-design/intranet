import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ fetch, cookies }) => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    cookies.delete('sessionId', { path: '/' })
    throw redirect(302, '/login')
  },
}
