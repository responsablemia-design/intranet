import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireAdmin } from '../auth/auth.middleware'

const prisma = new PrismaClient()

export async function espaciosRoutes(app: FastifyInstance) {

  // ── Listar espacios ───────────────────────────────────────────────────────
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const { tipo, planta, activo = 'true' } = req.query as Record<string, string>
    const where: any = { activo: activo === 'true' }
    if (tipo) where.tipo = tipo
    if (planta !== undefined && planta !== '') where.planta = parseInt(planta)

    const espacios = await prisma.espacio.findMany({
      where,
      include: {
        equipos: { where: { estado: { not: 'BAJA' } }, orderBy: { nombre: 'asc' } },
        _count: { select: { incidencias: { where: { estado: { in: ['ABIERTA', 'EN_PROCESO'] } } } } }
      },
      orderBy: [{ planta: 'asc' }, { codigo: 'asc' }]
    })

    return reply.send(espacios)
  })

  // ── Obtener un espacio con sus incidencias ────────────────────────────────
  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const espacio = await prisma.espacio.findUnique({
      where: { id },
      include: {
        equipos: { orderBy: { nombre: 'asc' } },
        incidencias: {
          include: {
            autor: { select: { id: true, name: true, avatar: true } },
            equipo: { select: { id: true, nombre: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })
    if (!espacio) return reply.code(404).send({ error: 'Espacio no encontrado' })
    return reply.send(espacio)
  })

  // ── Crear espacio (solo admin) ────────────────────────────────────────────
  app.post('/', { preHandler: requireAdmin }, async (req, reply) => {
    const { codigo, nombre, planta, tipo, notas } = req.body as any
    if (!codigo || !nombre || !tipo) return reply.code(400).send({ error: 'Faltan campos obligatorios' })

    const espacio = await prisma.espacio.create({
      data: { codigo, nombre, planta: planta ?? null, tipo, notas }
    })
    return reply.code(201).send(espacio)
  })

  // ── Editar espacio (solo admin) ───────────────────────────────────────────
  app.patch('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = req.body as any
    const espacio = await prisma.espacio.update({ where: { id }, data })
    return reply.send(espacio)
  })

  // ── Añadir equipo a un espacio (solo admin) ───────────────────────────────
  app.post('/:id/equipos', { preHandler: requireAdmin }, async (req, reply) => {
    const { id: espacioId } = req.params as { id: string }
    const { nombre, tipo, numeroSerie, notas } = req.body as any
    if (!nombre || !tipo) return reply.code(400).send({ error: 'Faltan campos: nombre, tipo' })

    const equipo = await prisma.equipo.create({
      data: { nombre, tipo, numeroSerie, notas, espacioId }
    })
    return reply.code(201).send(equipo)
  })

  // ── Editar equipo (solo admin) ────────────────────────────────────────────
  app.patch('/equipos/:equipoId', { preHandler: requireAdmin }, async (req, reply) => {
    const { equipoId } = req.params as { equipoId: string }
    const data = req.body as any
    const equipo = await prisma.equipo.update({ where: { id: equipoId }, data })
    return reply.send(equipo)
  })

  // ── Listar equipos de un espacio ──────────────────────────────────────────
  app.get('/:id/equipos', { preHandler: requireAuth }, async (req, reply) => {
    const { id: espacioId } = req.params as { id: string }
    const equipos = await prisma.equipo.findMany({
      where: { espacioId, estado: { not: 'BAJA' } },
      orderBy: { nombre: 'asc' }
    })
    return reply.send(equipos)
  })
}
