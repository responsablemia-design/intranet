import type { FastifyInstance } from 'fastify'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Configuración de Passport con Google OAuth2 ───────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value ?? ''
        const allowedDomain = process.env.ALLOWED_DOMAIN ?? ''

        // Solo se permite acceso a cuentas del dominio del centro
        if (!email.endsWith(`@${allowedDomain}`)) {
          return done(null, false, {
            message: `Acceso denegado. Solo se permiten cuentas @${allowedDomain}`,
          })
        }

        // Crear o actualizar el usuario en la base de datos
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            email,
          },
          create: {
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            // El primer usuario que se registra es ADMIN
            role: (await prisma.user.count()) === 0 ? 'ADMIN' : 'PROFESOR',
          },
        })

        // Bloquear usuarios desactivados
        if (!user.active) {
          return done(null, false, { message: 'Tu cuenta ha sido desactivada.' })
        }

        return done(null, user)
      } catch (err) {
        return done(err as Error)
      }
    }
  )
)

passport.serializeUser((user: any, done) => done(null, user.id))
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err)
  }
})

// ── Rutas de autenticación ────────────────────────────────────────────────────
export async function authRoutes(app: FastifyInstance) {
  // Iniciar login con Google
  app.get('/google', async (req, reply) => {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
    authUrl.searchParams.set('redirect_uri', process.env.GOOGLE_CALLBACK_URL!)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('hd', process.env.ALLOWED_DOMAIN!) // fuerza cuentas del dominio
    authUrl.searchParams.set('access_type', 'offline')
    reply.redirect(authUrl.toString())
  })

  // Callback de Google tras autenticación
  app.get('/google/callback', async (req, reply) => {
    const { code } = req.query as { code?: string }

    if (!code) {
      return reply.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`)
    }

    try {
      // Intercambiar código por tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          grant_type: 'authorization_code',
        }),
      })

      const tokens = await tokenRes.json() as { access_token?: string; error?: string }

      if (!tokens.access_token) {
        return reply.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`)
      }

      // Obtener datos del usuario de Google
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      const profile = await profileRes.json() as {
        sub: string; email: string; name: string; picture?: string
      }

      const allowedDomain = process.env.ALLOWED_DOMAIN ?? ''
      if (!profile.email.endsWith(`@${allowedDomain}`)) {
        return reply.redirect(`${process.env.FRONTEND_URL}/login?error=domain_not_allowed`)
      }

      // Upsert usuario
      const user = await prisma.user.upsert({
        where: { googleId: profile.sub },
        update: { name: profile.name, avatar: profile.picture, email: profile.email },
        create: {
          googleId: profile.sub,
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          role: (await prisma.user.count()) === 0 ? 'ADMIN' : 'PROFESOR',
        },
      })

      if (!user.active) {
        return reply.redirect(`${process.env.FRONTEND_URL}/login?error=account_disabled`)
      }

      // Guardar en sesión
      ;(req.session as any).userId = user.id
      ;(req.session as any).userRole = user.role

      return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`)
    } catch (err) {
      app.log.error(err)
      return reply.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`)
    }
  })

  // Datos del usuario en sesión
  app.get('/demo-login', async (req, reply) => {
	const session: any = req.session		
	session.userId = 'demo-user-1'
	session.user = {
		id: ' demo-user-1',
		email: 'demo@iesfelixdeazara.com',
		name: 'Usuario Demo',
		role: 'ADMIN'
    }
    return reply.redirect('http://172.30.200.240:3001/dashboard')
  })

  // Cerrar sesión
  app.post('/logout', async (req, reply) => {
    await req.session.destroy()
    reply.clearCookie('sessionId')
    return reply.send({ ok: true })
  })
}
