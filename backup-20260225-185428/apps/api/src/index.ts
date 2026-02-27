import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import fastifyCors from '@fastify/cors'
import { RedisStore } from 'connect-redis'
import { Redis } from 'ioredis'
import { authRoutes } from './auth/auth.routes'
import { userRoutes } from './users/user.routes'
import { incidenciasRoutes } from './incidencias/incidencias.routes'
import { espaciosRoutes } from './espacios/espacios.routes'

const app = Fastify({ logger: true })

async function main() {
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379')
  const redisStore = new RedisStore({ client: redis, prefix: 'session:' })

  await app.register(fastifyCors, {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  await app.register(fastifyCookie)
  await app.register(fastifySession, {
    secret: process.env.SESSION_SECRET ?? 'fallback-secret',
    store: redisStore as any,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
    },
    saveUninitialized: false,
  })

  await app.register(authRoutes,      { prefix: '/auth' })
  await app.register(userRoutes,      { prefix: '/api/users' })
  await app.register(incidenciasRoutes, { prefix: '/api/incidencias' })
  await app.register(espaciosRoutes,  { prefix: '/api/espacios' })

  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  const port = parseInt(process.env.PORT ?? '3000')
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`API escuchando en puerto ${port}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
