import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { API_URL } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, cookies, url, parent }) => {
  const { user } = await parent()
  if (!user) throw redirect(302, '/login')

  const params = new URLSearchParams()
  const estado = url.searchParams.get('estado')
  const prioridad = url.searchParams.get('prioridad')
  if (estado) params.set('estado', estado)
  if (prioridad) params.set('prioridad', prioridad)

  const res = await fetch(`${API_URL}/api/incidencias?${params}`)
  if (!res.ok) return { incidencias: [], total: 0, filtros: { estado, prioridad } }

  const data = await res.json()
  return { ...data, filtros: { estado, prioridad } }
}
