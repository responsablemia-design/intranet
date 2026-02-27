import { API_URL } from '$lib/api'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  return { user: locals.user }
}
