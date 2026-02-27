import type { FastifyRequest, FastifyReply } from 'fastify'

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  // BYPASS TEMPORAL PARA DEMOS
  (req as any).currentUser = {
    id: 'demo-user-1',
    email: 'demo@iesfelixdeazara.com',
    name: 'Usuario Demo',
    role: 'ADMIN'
  }
  // No hacer nada más, dejar pasar
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  // BYPASS TEMPORAL PARA DEMOS
  (req as any).currentUser = {
    id: 'demo-user-1',
    email: 'demo@iesfelixdeazara.com',
    name: 'Usuario Demo',
    role: 'ADMIN'
  }
  // No hacer nada más, dejar pasar
}
