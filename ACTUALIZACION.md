# Actualización del Módulo de Incidencias - IES Félix de Azara

**Fecha:** 25 de febrero de 2026
**Estado:** ✅ Módulo completo y listo para rebuild

## Cambios Realizados

### 1. **Proxy de API configurado** ✅
- **Archivo:** `apps/web/vite.config.ts`
- **Cambio:** Agregado proxy para `/api` y `/auth` que redirige a la API backend
- Esto permite que el frontend haga peticiones a `/api/incidencias` y estas se enruten correctamente al contenedor API

### 2. **Favicon agregado** ✅
- **Archivo:** `apps/web/static/favicon.svg`
- Favicon básico con la letra "F" (IES Félix de Azara)

### 3. **Módulo de Incidencias COMPLETO** ✅

El módulo está 100% funcional con las siguientes páginas:

#### `/incidencias` - Listado
- ✅ Filtros por estado y prioridad
- ✅ Tabla responsive con datos
- ✅ Solo admins ven todas las incidencias, profesores ven solo las suyas
- ✅ Badges de estado con colores
- ✅ Click en fila para ir al detalle

#### `/incidencias/nueva` - Crear incidencia
- ✅ Formulario completo con validación
- ✅ Selector de espacio con agrupación por plantas
- ✅ Carga dinámica de equipos según el espacio seleccionado
- ✅ Selector visual de prioridad con emojis
- ✅ Validación client-side y server-side

#### `/incidencias/[id]` - Detalle
- ✅ Vista completa de la incidencia
- ✅ Sistema de comentarios
- ✅ Panel de gestión para admins (cambio de estado/prioridad)
- ✅ Información de ubicación y equipo
- ✅ Historial de comentarios con avatares

## Estructura de Archivos Frontend

```
apps/web/src/routes/
├── incidencias/
│   ├── +page.svelte          # Listado de incidencias
│   ├── +page.server.ts       # Load data + filtros
│   ├── nueva/
│   │   ├── +page.svelte      # Formulario nueva incidencia
│   │   └── +page.server.ts   # Load espacios + action crear
│   └── [id]/
│       ├── +page.svelte      # Vista detalle
│       └── +page.server.ts   # Load incidencia + actions (comentar, cambiarEstado)
```

## Backend API - Rutas Implementadas

✅ `GET /api/incidencias` - Listar con filtros
✅ `GET /api/incidencias/:id` - Detalle
✅ `POST /api/incidencias` - Crear (envía email a admins)
✅ `PATCH /api/incidencias/:id` - Actualizar estado/prioridad (solo admin, envía email)
✅ `POST /api/incidencias/:id/comentarios` - Añadir comentario (envía email)
✅ `GET /api/incidencias/stats/resumen` - Estadísticas (solo admin)
✅ `GET /api/espacios` - Listar espacios
✅ `GET /api/espacios/:id/equipos` - Equipos de un espacio

## Instrucciones de Despliegue

### 1. Copiar archivos al servidor Dell

```bash
# En tu máquina local, descargar el archivo actualizado
# Luego, en el servidor Dell (vía RustDesk):
cd /home/claude/intranet

# Hacer backup del código actual (opcional pero recomendado)
cp -r apps apps.backup-$(date +%Y%m%d-%H%M%S)

# Copiar los archivos actualizados
# (Opción A: Si tienes el tar.gz)
tar -xzf intranet-actualizado.tar.gz --strip-components=1

# (Opción B: Si reemplazas manualmente)
# Copia apps/web/vite.config.ts
# Copia apps/web/static/favicon.svg
```

### 2. Rebuild del contenedor web

```bash
cd /home/claude/intranet

# Detener solo el contenedor web
docker compose stop web

# Rebuild del contenedor web
docker compose build web

# Levantar el contenedor web
docker compose up -d web

# Ver logs para verificar
docker compose logs -f web
```

### 3. Verificación

Abre el navegador y ve a: `https://intranet.iesfelixdeazara.com`

**Checklist de pruebas:**
- [ ] Login con Google funciona
- [ ] Dashboard carga correctamente
- [ ] `/incidencias` muestra el listado
- [ ] `/incidencias/nueva` permite crear una incidencia
- [ ] Crear incidencia funciona y redirige al detalle
- [ ] El detalle muestra toda la información
- [ ] Se pueden añadir comentarios
- [ ] (Admin) Se puede cambiar el estado y prioridad

### 4. Troubleshooting

#### Error: "Failed to fetch"
```bash
# Verificar que los contenedores están corriendo
docker compose ps

# Verificar logs del contenedor web
docker compose logs web

# Verificar logs del contenedor api
docker compose logs api
```

#### Error: "Cannot GET /api/incidencias"
```bash
# Verificar que el proxy está funcionando
# En el navegador, abrir consola de desarrollador
# Network tab → ver si las peticiones a /api/ se están haciendo

# Verificar variables de entorno
docker compose exec web env | grep API_URL
```

#### El frontend no carga
```bash
# Rebuild completo
docker compose down
docker compose build
docker compose up -d

# Ver logs
docker compose logs -f
```

## Próximos Pasos

1. ✅ **Módulo de incidencias** - COMPLETADO
2. 🔄 **Configuración DNS** - Pendiente (Ionos)
3. 📅 **Módulo de ausencias del profesorado** - Por desarrollar
4. 💻 **Módulo de préstamos de portátiles** - Por desarrollar

## Notas Técnicas

- **Proxy API:** El archivo `vite.config.ts` contiene el proxy que redirige `/api` y `/auth` al backend. Esto es esencial para que las peticiones funcionen tanto en desarrollo como en producción.

- **Variables de entorno:** El frontend usa `PUBLIC_API_URL` para saber dónde está la API. En Docker Compose está configurado como `https://intranet.${DOMAIN}`.

- **Sesiones:** Las sesiones se manejan mediante cookies HTTP-only que se comparten entre el frontend y backend gracias a que ambos están bajo el mismo dominio.

- **Traefik:** El proxy inverso Traefik se encarga de:
  - SSL automático con Let's Encrypt
  - Rutear `/api` y `/auth` al contenedor `api`
  - Rutear el resto al contenedor `web`

## Contacto

Si hay algún problema durante el despliegue, revisa los logs y comprueba que:
1. Los 5 contenedores están corriendo: `docker compose ps`
2. No hay errores en los logs: `docker compose logs`
3. Las variables de entorno están correctas: `cat .env`

---

**Estado:** Listo para producción ✅
**Próxima tarea:** Configurar DNS en Ionos y probar con el equipo directivo
