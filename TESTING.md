# Guía de Testing - Módulo de Incidencias

## Checklist de Verificación Post-Despliegue

### 1. Verificación de Contenedores ✓

```bash
# Ver estado de todos los contenedores
docker compose ps

# Deberías ver 5 contenedores corriendo:
# - traefik (Up)
# - mariadb (Up, healthy)
# - redis (Up)
# - intranet-api (Up)
# - intranet-web (Up)
```

**Resultado esperado:**
```
NAME            STATE    STATUS         PORTS
traefik         running  Up 2 minutes   80/tcp, 443/tcp
mariadb         running  Up 2 minutes   (healthy)
redis           running  Up 2 minutes
intranet-api    running  Up 2 minutes
intranet-web    running  Up 2 minutes
```

### 2. Verificación de Logs ✓

```bash
# Ver logs del contenedor web
docker compose logs web --tail=50

# No debería haber errores críticos
# Buscar línea: "Listening on http://0.0.0.0:3001"
```

```bash
# Ver logs del contenedor API
docker compose logs api --tail=50

# Buscar línea: "Server listening at http://0.0.0.0:3000"
# No debería haber errores de conexión a DB o Redis
```

### 3. Test de Acceso Web ✓

**URL:** `https://intranet.iesfelixdeazara.com`

**Pasos:**
1. Abre el navegador en modo incógnito
2. Navega a la URL
3. Deberías ver la página de login
4. Haz clic en "Iniciar sesión con Google"
5. Selecciona tu cuenta @iesfelixdeazara.com
6. Deberías ser redirigido al dashboard

**Problemas comunes:**
- **Error de conexión:** Verifica que Traefik está corriendo
- **Certificado no válido:** Puede tardar unos minutos en generarse, espera y recarga
- **"Site can't be reached":** Verifica la configuración DNS

### 4. Test del Módulo de Incidencias ✓

#### A) Listado de Incidencias

1. Navega a "Incidencias TIC" en el menú lateral
2. **Verificar:**
   - ✓ La página carga sin errores
   - ✓ Se muestra el botón "+ Nueva incidencia"
   - ✓ Aparecen los filtros (Estado, Prioridad si eres admin)
   - ✓ Si hay incidencias, se muestran en la tabla

**Consola del navegador:** No debería haber errores en rojo

#### B) Crear Nueva Incidencia

1. Haz clic en "+ Nueva incidencia"
2. **Verificar:**
   - ✓ El formulario carga correctamente
   - ✓ El selector de "Espacio afectado" tiene opciones agrupadas por planta
   - ✓ Selecciona un espacio (ej: "Aula 108")
   - ✓ El selector de "Equipo afectado" se activa y carga equipos
   
3. **Rellenar formulario:**
   - Título: "Test - Proyector no enciende"
   - Espacio: Seleccionar cualquier aula
   - Equipo: (opcional) Seleccionar un equipo
   - Prioridad: Media
   - Descripción: "Esto es una prueba del sistema de incidencias"

4. **Submit:**
   - Haz clic en "Registrar incidencia"
   - **Verificar:**
     - ✓ No hay errores
     - ✓ Redirige automáticamente a la página de detalle
     - ✓ Aparece toda la información de la incidencia

5. **Verificar email:**
   - Los usuarios con rol ADMIN deberían recibir un email de notificación
   - Asunto: "[Intranet] Nueva incidencia: Test - Proyector no enciende"

#### C) Vista de Detalle de Incidencia

Estando en la página de detalle de la incidencia recién creada:

1. **Verificar información mostrada:**
   - ✓ Título correcto
   - ✓ Descripción correcta
   - ✓ Badge de estado "Abierta" (rojo)
   - ✓ Badge de prioridad "Media" (azul)
   - ✓ Información del espacio (nombre, planta, tipo)
   - ✓ Información del autor (tu nombre y avatar)
   - ✓ Fecha de registro

2. **Añadir Comentario:**
   - Escribe en el textarea: "Comentario de prueba"
   - Haz clic en "Enviar comentario"
   - **Verificar:**
     - ✓ El comentario aparece inmediatamente
     - ✓ Muestra tu avatar y nombre
     - ✓ Muestra la fecha/hora actual

3. **Panel de Administración (solo si eres ADMIN):**
   - Debería aparecer un panel "⚙️ Gestión (Admin)"
   - **Cambiar estado:**
     - Selecciona "En proceso"
     - Haz clic en "Guardar cambios"
     - **Verificar:**
       - ✓ El badge de estado cambia a "En proceso" (amarillo)
       - ✓ Se envía email al autor notificando el cambio

#### D) Volver al Listado

1. Haz clic en "← Volver a incidencias"
2. **Verificar:**
   - ✓ La incidencia de prueba aparece en el listado
   - ✓ El estado se muestra correctamente
   - ✓ Hacer clic en la fila te lleva al detalle

#### E) Filtros

1. En el listado, prueba los filtros:
   - Selecciona "Estado: Abierta"
   - Haz clic en "Filtrar"
   - **Verificar:** Solo se muestran incidencias abiertas
   
2. Haz clic en "Limpiar"
   - **Verificar:** Vuelven a aparecer todas las incidencias

### 5. Test de API Directa (Opcional) ✓

```bash
# Test de health check
curl https://intranet.iesfelixdeazara.com/api/health

# Respuesta esperada:
# {"status":"ok"}
```

```bash
# Test de autenticación (requiere cookie válida)
# Obtén la cookie desde el navegador (DevTools > Application > Cookies)
curl https://intranet.iesfelixdeazara.com/auth/me \
  -H "Cookie: connect.sid=XXXXXXXXXX"

# Respuesta esperada:
# {"id":"xxx","email":"xxx@iesfelixdeazara.com","name":"...","role":"..."}
```

### 6. Test de Base de Datos ✓

```bash
# Conectar a MariaDB
docker compose exec mariadb mariadb -u intranet_user -p intranet

# Dentro de MariaDB:
SELECT COUNT(*) FROM incidencias;
SELECT COUNT(*) FROM espacios;
SELECT COUNT(*) FROM equipos;
SELECT COUNT(*) FROM users;

# Deberías ver:
# - 78 espacios (seed inicial)
# - Equipos en las aulas
# - Al menos 1 usuario (el tuyo)
# - Las incidencias que has creado
```

### 7. Test de Rendimiento ✓

```bash
# Monitorear uso de recursos
docker stats

# Verificar que:
# - Ningún contenedor usa >80% CPU de manera sostenida
# - Uso de memoria es razonable (<200MB por contenedor)
```

## Problemas Comunes y Soluciones

### "Failed to fetch /api/incidencias"

**Causa:** El proxy de API no está funcionando

**Solución:**
```bash
# Rebuild del contenedor web
docker compose stop web
docker compose build web
docker compose up -d web

# Ver logs
docker compose logs -f web
```

### "Cannot read properties of null"

**Causa:** El usuario no está autenticado correctamente

**Solución:**
1. Cierra sesión: `/logout`
2. Borra cookies del navegador
3. Vuelve a iniciar sesión

### Las incidencias no aparecen

**Causa:** Problema con la base de datos o permisos

**Solución:**
```bash
# Verificar conexión a BD
docker compose logs api | grep -i "database\|prisma"

# Verificar que el usuario tiene incidencias
docker compose exec mariadb mariadb -u intranet_user -p intranet \
  -e "SELECT COUNT(*) FROM incidencias;"
```

### Emails no se envían

**Causa:** Nodemailer no está configurado

**Solución:**
El módulo de emails está implementado pero requiere configuración SMTP.
Si no es crítico, las incidencias funcionan sin emails.

Para configurar SMTP, edita `.env` y añade:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

## Métricas de Éxito

✅ **Todo funciona correctamente si:**
- Puedes crear incidencias
- Las incidencias aparecen en el listado
- Puedes ver el detalle de cada incidencia
- Puedes añadir comentarios
- (Admin) Puedes cambiar el estado
- No hay errores en la consola del navegador
- Los logs de Docker no muestran errores críticos

## Siguiente Fase

Una vez verificado que el módulo de incidencias funciona:

1. **Configurar DNS** en Ionos (si aún no está hecho)
2. **Demo al equipo directivo** para obtener feedback
3. **Desarrollar módulo de ausencias** del profesorado
4. **Desarrollar módulo de préstamos** de portátiles

## Contacto y Soporte

Para cualquier problema durante el testing:
1. Captura los logs: `docker compose logs > logs.txt`
2. Captura la salida de: `docker compose ps`
3. Documenta los pasos exactos para reproducir el error
4. Revisa ARQUITECTURA.md para entender el flujo de datos
