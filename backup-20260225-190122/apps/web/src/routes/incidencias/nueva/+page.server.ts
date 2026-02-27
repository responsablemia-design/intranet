import type { PageServerLoad, Actions } from './$types'
import { redirect, fail } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const { user } = await parent()
  if (!user) throw redirect(302, '/login')

  const res = await fetch('/api/espacios?activo=true')
  const espacios = res.ok ? await res.json() : []
  return { espacios }
}

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData()
    const titulo = data.get('titulo')?.toString().trim() ?? ''
    const descripcion = data.get('descripcion')?.toString().trim() ?? ''
    const espacioId = data.get('espacioId')?.toString() ?? ''
    const equipoId = data.get('equipoId')?.toString() ?? ''
    const prioridad = data.get('prioridad')?.toString() ?? 'MEDIA'

    const errors: Record<string, string> = {}
    if (!titulo) errors.titulo = 'El título es obligatorio'
    if (!descripcion) errors.descripcion = 'La descripción es obligatoria'
    if (!espacioId) errors.espacioId = 'Debes seleccionar un espacio'

    if (Object.keys(errors).length) {
      return fail(400, { errors, titulo, descripcion, espacioId, equipoId, prioridad })
    }

    const res = await fetch('/api/incidencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, espacioId, equipoId: equipoId || undefined, prioridad })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return fail(res.status, { error: err.error ?? 'Error al crear la incidencia', titulo, descripcion, espacioId, equipoId, prioridad })
    }

    const incidencia = await res.json()
    throw redirect(303, `/incidencias/${incidencia.id}`)
  }
}
