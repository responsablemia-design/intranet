# Intranet IES Félix de Azara

Portal intranet del centro. Stack: SvelteKit + Fastify + TypeScript + MariaDB + Docker.

## Requisitos del servidor (Dell T-310)

- Docker ≥ 29
- Docker Compose ≥ v5
- Git ≥ 2.43
- Puerto 80 y 443 abiertos en el router/firewall del centro

---

## 🚀 Puesta en marcha (paso a paso)

### 1. Clonar el repositorio

```bash
git clone https://github.com/responsablemia-design/intranet.git
cd intranet
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env   # Editar con los valores reales
```

Genera un SESSION_SECRET seguro:
```bash
openssl rand -base64 48
```

### 3. Configurar Google OAuth2

1. Entra en https://console.cloud.google.com
2. Crear proyecto → "Intranet IES Félix de Azara"
3. APIs y servicios → Pantalla de consentimiento OAuth → Interno (solo tu dominio)
4. APIs y servicios → Credenciales → Crear ID de cliente OAuth 2.0
   - Tipo: Aplicación web
   - URI de redireccionamiento autorizado: `https://intranet.iesfelixdeazara.com/auth/google/callback`
5. Copiar Client ID y Client Secret al .env

### 4. Configurar subdominios DNS

En la consola de Google Domains (o donde tengas el dominio):
```
intranet.iesfelixdeazara.com  →  A  →  IP del T-310
```

### 5. Levantar el proyecto

```bash
# Primera vez (construye las imágenes y crea la BD)
docker compose up --build -d

# Ver logs en tiempo real
docker compose logs -f

# Parar todo
docker compose down
```

### 6. Verificar que funciona

- https://intranet.iesfelixdeazara.com → Login con Google
- https://intranet.iesfelixdeazara.com/api/health → `{"status":"ok"}`

---

## 🛠️ Desarrollo local

```bash
# En el equipo de desarrollo (no en el T-310)
cd apps/api && npm install && npm run dev
cd apps/web && npm install && npm run dev
```

El frontend queda en http://localhost:3001  
La API en http://localhost:3000

---

## 📁 Estructura del proyecto

```
intranet/
├── docker-compose.yml        ← orquestación de todos los servicios
├── .env.example              ← plantilla de variables de entorno
├── traefik/
│   └── letsencrypt/          ← certificados SSL (generado automáticamente)
└── apps/
    ├── api/                  ← Backend Node.js + Fastify + TypeScript
    │   ├── src/
    │   │   ├── auth/         ← Google OAuth2 + middleware de autenticación
    │   │   └── users/        ← gestión de usuarios y roles
    │   ├── prisma/
    │   │   └── schema.prisma ← modelo de base de datos
    │   └── Dockerfile
    └── web/                  ← Frontend SvelteKit + TypeScript
        ├── src/
        │   └── routes/
        │       ├── login/    ← página de login
        │       └── dashboard/← panel principal
        └── Dockerfile
```

---

## 🔄 Flujo de trabajo Git

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/modulo-incidencias

# Trabajar, commitear...
git add .
git commit -m "feat: añadir módulo de incidencias TIC"

# Subir y crear Pull Request
git push origin feature/modulo-incidencias
```

Ramas:
- `main` → producción (T-310, acceso real)
- `develop` → integración y pruebas
- `feature/*` → desarrollo de funcionalidades

---

## 🔒 Seguridad

- Acceso restringido a cuentas `@iesfelixdeazara.com` (validado en backend)
- HTTPS obligatorio (Traefik + Let's Encrypt automático)
- Sesiones almacenadas en Redis con expiración de 7 días
- Base de datos no expuesta a internet (red Docker interna)
- Primer usuario registrado obtiene rol ADMIN automáticamente

---

## 📋 Comandos útiles

```bash
# Ver estado de los contenedores
docker compose ps

# Reiniciar solo la API (tras cambios)
docker compose restart api

# Acceder a la BD desde la terminal
docker compose exec mariadb mariadb -u intranet_user -p intranet

# Backup de la base de datos
docker compose exec mariadb mariadb-dump -u root -p intranet > backup_$(date +%Y%m%d).sql

# Ver logs de un servicio concreto
docker compose logs -f api
docker compose logs -f web
```
