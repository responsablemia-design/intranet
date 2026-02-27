import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  // En modo demo, redirigir directo al dashboard
  throw redirect(302, '/dashboard')
}