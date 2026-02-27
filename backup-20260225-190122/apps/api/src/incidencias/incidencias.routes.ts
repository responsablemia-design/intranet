import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireAdmin } from '../auth/auth.middleware'
import { sendEmail } from '../common/mailer'

const prisma = new PrismaClient()

const incidenciaSelect = {
  id: true,
  titulo: true,
  descripcion: true,
  estado: true,
  prioridad: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  espacio: { select: { id: true, codigo: true, nombre: true, planta: true, tipo: true } },
  equipo:  { select: { id: true, nombre: true, tipo: true } },
  autor:   { select: { id: true, name: true, email: true, avatar: true } },
  asignado:{ select: { id: true, name: true, email: true, avatar: true } },
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
    const { estado, espacioId, page = '1', limit = '20' } = req.query as Record<string, string>

    const where: any = {}
    if (estado) where.estado = estado
    if (espacioId) where.espacioId = espacioId
    if (user.role !== 'ADMIN') where.autorId = user.id

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

    if (user.role !== 'ADMIN' && incidencia.autor.id !== user.id) {
      return reply.code(403).send({ error: 'Acceso denegado' })
    }

    return reply.send(incidencia)
  })

  // ── Crear incidencia ──────────────────────────────────────────────────────
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const user = (req as any).currentUser
    const { titulo, descripcion, espacioId, equipoId, prioridad = 'MEDIA' } = req.body as {
      titulo: string
      descripcion: string
      espacioId: string
      equipoId?: string
      prioridad?: string
    }

    if (!titulo || !descripcion || !espacioId) {
      return reply.code(400).send({ error: 'Faltan campos: titulo, descripcion, espacioId' })
    }

    const incidencia = await prisma.incidencia.create({
      data: {
        titulo,
        descripcion,
        prioridad: prioridad as any,
        espacioId,
        equipoId: equipoId || null,
        autorId: user.id
      },
      select: incidenciaSelect,
    })

    // Notificar a los admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', active: true } })
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `[Intranet] Nueva incidencia: ${titulo}`,
        html: `
          <h2>Nueva incidencia registrada</h2>
          <p><strong>Título:</strong> ${titulo}</p>
          <p><strong>Espacio:</strong> ${incidencia.espacio.nombre}</p>
          ${incidencia.equipo ? `<p><strong>Equipo:</strong> ${incidencia.equipo.nombre}</p>` : ''}
          <p><strong>Prioridad:</strong> ${prioridad}</p>
          <p><strong>Descripción:</strong> ${descripcion}</p>
          <p><strong>Registrada por:</strong> ${user.name} (${user.email})</p>
          <hr>
          <p><a href="${process.env.FRONTEND_URL}/incidencias/${incidencia.id}">Ver incidencia</a></p>
        `
      })
    }

    return reply.code(201).send(incidencia)
  })

  // ── Actualizar estado / asignación (solo admin) ───────────────────────────
  app.patch('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { estado, asignadoId, prioridad } = req.body as any

    const incidencia = await prisma.incidencia.findUnique({ where: { id }, select: incidenciaSelect })
    if (!incidencia) return reply.code(404).send({ error: 'Incidencia no encontrada' })

    const data: any = {}
    if (estado)   data.estado = estado
    if (prioridad) data.prioridad = prioridad
    if (asignadoId !== undefined) data.asignadoId = asignadoId || null
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
      select: { id: true, titulo: true, autor: { select: { email: true } } }
    })
    if (!incidencia) return reply.code(404).send({ error: 'Incidencia no encontrada' })

    const comentario = await prisma.comentario.create({
      data: { contenido, incidenciaId: id, autorId: user.id },
      select: {
        id: true, contenido: true, createdAt: true,
        autor: { select: { id: true, name: true, avatar: true } }
      }
    })

    if (incidencia.autor.email !== user.email) {
      await sendEmail({
        to: incidencia.autor.email,
        subject: `[Intranet] Nuevo comentario en: ${incidencia.titulo}`,
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

  // ── Estadísticas (solo admin) ─────────────────────────────────────────────
  app.get('/stats/resumen', { preHandler: requireAdmin }, async (_req, reply) => {
    const [total, porEstado, porPrioridad] = await Promise.all([
      prisma.incidencia.count(),
      prisma.incidencia.groupBy({ by: ['estado'], _count: true }),
      prisma.incidencia.groupBy({ by: ['prioridad'], _count: true }),
    ])
    return reply.send({ total, porEstado, porPrioridad })
  })
}
