import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireAdmin } from '../auth/auth.middleware'

const prisma = new PrismaClient()

export async function userRoutes(app: FastifyInstance) {
  // Perfil del usuario actual
  app.get('/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = (req as any).currentUser
    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    })
  })

  // Listar todos los usuarios (solo ADMIN)
  app.get('/', { preHandler: requireAdmin }, async (_req, reply) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, avatar: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    })
    return reply.send(users)
  })

  // Cambiar rol de un usuario (solo ADMIN)
  app.patch('/:id/role', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { role } = req.body as { role: 'ADMIN' | 'PROFESOR' | 'ALUMNO' }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    })
    return reply.send(user)
  })

  // Activar / desactivar usuario (solo ADMIN)
  app.patch('/:id/active', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { active } = req.body as { active: boolean }

    const user = await prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, email: true, name: true, active: true },
    })
    return reply.send(user)
  })
}
