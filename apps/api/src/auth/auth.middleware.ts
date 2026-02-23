import type { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Middleware: requiere sesión activa
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.session as any).userId
  if (!userId) {
    return reply.code(401).send({ error: 'No autenticado' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.active) {
    return reply.code(401).send({ error: 'Sesión inválida' })
  }

  // Adjuntar usuario al request para uso en los handlers
  ;(req as any).currentUser = user
}

// Middleware: requiere rol ADMIN
export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply)
  const user = (req as any).currentUser
  if (user?.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Acceso denegado. Se requiere rol de administrador.' })
  }
}
