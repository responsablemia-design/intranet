import type { PageServerLoad, Actions } from './$types'
import { redirect, fail, error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
  const { user } = await parent()
  if (!user) throw redirect(302, '/login')

  const res = await fetch(`/api/incidencias/${params.id}`)
  if (res.status === 404) throw error(404, 'Incidencia no encontrada')
  if (res.status === 403) throw error(403, 'No tienes acceso a esta incidencia')
  if (!res.ok) throw error(500, 'Error al cargar la incidencia')

  const incidencia = await res.json()
  return { incidencia }
}

export const actions: Actions = {
  comentar: async ({ request, fetch, params }) => {
    const data = await request.formData()
    const contenido = data.get('contenido')?.toString().trim() ?? ''

    if (!contenido) return fail(400, { errorComentario: 'El comentario no puede estar vacío' })

    const res = await fetch(`/api/incidencias/${params.id}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return fail(res.status, { errorComentario: err.error ?? 'Error al enviar el comentario' })
    }

    throw redirect(303, `/incidencias/${params.id}`)
  },

  cambiarEstado: async ({ request, fetch, params }) => {
    const data = await request.formData()
    const estado = data.get('estado')?.toString()
    const prioridad = data.get('prioridad')?.toString()

    const res = await fetch(`/api/incidencias/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, prioridad })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return fail(res.status, { errorAdmin: err.error ?? 'Error al actualizar la incidencia' })
    }

    throw redirect(303, `/incidencias/${params.id}`)
  }
}
