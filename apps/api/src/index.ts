import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import fastifyCors from '@fastify/cors'
import { RedisStore } from 'connect-redis'
import { Redis } from 'ioredis'
import { authRoutes } from './auth/auth.routes'
import { userRoutes } from './users/user.routes'

const app = Fastify({ logger: true })

async function main() {
  // ── Redis para sesiones ──────────────────────────────────────────────────
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379')
  const redisStore = new RedisStore({ client: redis, prefix: 'session:' })

  // ── CORS ─────────────────────────────────────────────────────────────────
  await app.register(fastifyCors, {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  // ── Cookies + sesiones ───────────────────────────────────────────────────
  await app.register(fastifyCookie)
  await app.register(fastifySession, {
    secret: process.env.SESSION_SECRET ?? 'fallback-secret-change-in-production',
    store: redisStore as any,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      sameSite: 'lax',
    },
    saveUninitialized: false,
  })

  // ── Rutas ────────────────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(userRoutes, { prefix: '/api/users' })

  // ── Healthcheck ──────────────────────────────────────────────────────────
  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ── Arranque ─────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '3000')
  await app.listen({ port, host: '0.0.0.0' })
  app.log.info(`API escuchando en puerto ${port}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
