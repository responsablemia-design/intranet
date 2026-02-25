import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireAdmin } from '../auth/auth.middleware'
import { sendEmail } from '../common/mailer'

const prisma = new PrismaClient()

const incidenciaSelect = {
  id: true,
  titulo: true,
  descripcion: true,
  categoria: true,
  estado: true,
  prioridad: true,
  ubicacion: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  autor: { select: { id: true, name: true, email: true, avatar: true } },
  asignado: { select: { id: true, name: true, email: true, avatar: true } },
  comentarios: {
    select: {
      id: true, contenido: true, createdAt: true,
      autor: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'asc' as const }
  },
}

export async function incidenciasRoutes(app: FastifyInstance) {

  // ── Listar incidencias ────────────────────────────────────────────────────
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const user = (req as any).currentUser
    const { estado, categoria, asignadoId, page = '1', limit = '20' } = req.query as Record<string, string>

    const where: any = {}
    if (estado) where.estado = estado
    if (categoria) where.categoria = categoria
    if (asignadoId) where.asignadoId = asignadoId

    // Los no-admin solo ven sus propias incidencias salvo que sean TIC (ADMIN ve todo)
    if (user.role !== 'ADMIN') {
      where.autorId = user.id
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [incidencias, total] = await Promise.all([
      prisma.incidencia.findMany({
        where,
        select: incidenciaSelect,
        orderBy: [{ estado: 'asc' }, { prioridad: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: parseInt(limit),
      }),
      prisma.incidencia.count({ where })
    ])

    return reply.send({ incidencias, total, page: parseInt(page), limit: parseInt(limit) })
  })

  // ── Obtener una incidencia ────────────────────────────────────────────────
  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = (req as any).currentUser

    const incidencia = await prisma.incidencia.findUnique({ where: { id }, select: incidenciaSelect })
    if (!incidencia) return reply.code(404).send({ error: 'Incidencia no encontrada' })

    // Solo el autor o un admin puede ver los detalles
    if (user.role !== 'ADMIN' && incidencia.autor.id !== user.id) {
      return reply.code(403).send({ error: 'Acceso denegado' })
    }

    return reply.send(incidencia)
  })

  // ── Crear incidencia ──────────────────────────────────────────────────────
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const user = (req as any).currentUser
    const { titulo, descripcion, categoria, prioridad = 'MEDIA', ubicacion } = req.body as {
      titulo: string
      descripcion: string
      categoria: 'TIC' | 'AULA'
      prioridad?: string
      ubicacion?: string
    }

    if (!titulo || !descripcion || !categoria) {
      return reply.code(400).send({ error: 'Faltan campos obligatorios: titulo, descripcion, categoria' })
    }

    const incidencia = await prisma.incidencia.create({
      data: { titulo, descripcion, categoria, prioridad: prioridad as any, ubicacion, autorId: user.id },
      select: incidenciaSelect,
    })

    // Notificar a los admins de la nueva incidencia
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', active: true }, select: { email: true, name: true } })
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `[Intranet] Nueva incidencia: ${titulo}`,
        html: `
          <h2>Nueva incidencia registrada</h2>
          <p><strong>Título:</strong> ${titulo}</p>
          <p><strong>Categoría:</strong> ${categoria}</p>
          <p><strong>Prioridad:</strong> ${prioridad}</p>
          <p><strong>Ubicación:</strong> ${ubicacion ?? 'No especificada'}</p>
          <p><strong>Descripción:</strong> ${descripcion}</p>
          <p><strong>Registrada por:</strong> ${user.name} (${user.email})</p>
          <hr>
          <p><a href="${process.env.FRONTEND_URL}/incidencias/${incidencia.id}">Ver incidencia</a></p>
        `
      })
    }

    return reply.code(201).send(incidencia)
  })

  // ── Actualizar estado / asignación ────────────────────────────────────────
  app.patch('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { estado, asignadoId, prioridad } = req.body as {
      estado?: string
      asignadoId?: string
      prioridad?: string
    }

    const incidencia = await prisma.incidencia.findUnique({ where: { id }, select: incidenciaSelect })
    if (!incidencia) return reply.code(404).send({ error: 'Incidencia no encontrada' })

    const data: any = {}
    if (estado) data.estado = estado
    if (asignadoId !== undefined) data.asignadoId = asignadoId || null
    if (prioridad) data.prioridad = prioridad
    if (estado === 'RESUELTA' && incidencia.estado !== 'RESUELTA') data.resolvedAt = new Date()
    if (estado && estado !== 'RESUELTA') data.resolvedAt = null

    const actualizada = await prisma.incidencia.update({ where: { id }, data, select: incidenciaSelect })

    // Notificar al autor del cambio de estado
    if (estado && estado !== incidencia.estado) {
      const estadoLabel: Record<string, string> = {
        ABIERTA: 'Abierta', EN_PROCESO: 'En proceso', RESUELTA: 'Resuelta', CERRADA: 'Cerrada'
      }
      await sendEmail({
        to: incidencia.autor.email,
        subject: `[Intranet] Tu incidencia ha cambiado a: ${estadoLabel[estado] ?? estado}`,
        html: `
          <h2>Actualización de tu incidencia</h2>
          <p><strong>Incidencia:</strong> ${incidencia.titulo}</p>
          <p><strong>Nuevo estado:</strong> ${estadoLabel[estado] ?? estado}</p>
          ${actualizada.asignado ? `<p><strong>Asignada a:</strong> ${actualizada.asignado.name}</p>` : ''}
          <hr>
          <p><a href="${process.env.FRONTEND_URL}/incidencias/${id}">Ver incidencia</a></p>
        `
      })
    }

    return reply.send(actualizada)
  })

  // ── Añadir comentario ─────────────────────────────────────────────────────
  app.post('/:id/comentarios', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = (req as any).currentUser
    const { contenido } = req.body as { contenido: string }

    if (!contenido?.trim()) return reply.code(400).send({ error: 'El comentario no puede estar vacío' })

    const incidencia = await prisma.incidencia.findUnique({
      where: { id },
      select: { id: true, titulo: true, autor: { select: { email: true, name: true } } }
    })
    if (!incidencia) return reply.code(404).send({ error: 'Incidencia no encontrada' })

    const comentario = await prisma.comentario.create({
      data: { contenido, incidenciaId: id, autorId: user.id },
      select: {
        id: true, contenido: true, createdAt: true,
        autor: { select: { id: true, name: true, avatar: true } }
      }
    })

    // Notificar al autor si el comentario lo hace otro
    if (incidencia.autor.email !== user.email) {
      await sendEmail({
        to: incidencia.autor.email,
        subject: `[Intranet] Nuevo comentario en tu incidencia: ${incidencia.titulo}`,
        html: `
          <h2>Nuevo comentario en tu incidencia</h2>
          <p><strong>Incidencia:</strong> ${incidencia.titulo}</p>
          <p><strong>Comentario de ${user.name}:</strong></p>
          <blockquote>${contenido}</blockquote>
          <hr>
          <p><a href="${process.env.FRONTEND_URL}/incidencias/${id}">Ver incidencia</a></p>
        `
      })
    }

    return reply.code(201).send(comentario)
  })

  // ── Estadísticas para el panel admin ─────────────────────────────────────
  app.get('/stats/resumen', { preHandler: requireAdmin }, async (_req, reply) => {
    const [total, porEstado, porCategoria, porPrioridad] = await Promise.all([
      prisma.incidencia.count(),
      prisma.incidencia.groupBy({ by: ['estado'], _count: true }),
      prisma.incidencia.groupBy({ by: ['categoria'], _count: true }),
      prisma.incidencia.groupBy({ by: ['prioridad'], _count: true }),
    ])

    return reply.send({ total, porEstado, porCategoria, porPrioridad })
  })
}
