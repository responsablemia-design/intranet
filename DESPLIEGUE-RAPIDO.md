# 🚀 Guía Rápida de Despliegue - Intranet IES Félix de Azara

## Archivos Necesarios

Descarga estos 2 archivos a tu máquina local y cópialos al servidor Dell:

1. ✅ `intranet-actualizado.tar.gz` - Código actualizado
2. ✅ `deploy.sh` - Script de despliegue automático

---

## 📦 Opción A: Despliegue Automático (RECOMENDADO)

### Paso 1: Copiar archivos al servidor

Desde tu máquina local, copia los archivos al Dell:

```bash
# Ejemplo si usas SCP (ajusta la IP y ruta)
scp intranet-actualizado.tar.gz deploy.sh usuario@172.30.200.240:/home/claude/intranet/
```

O cópialos manualmente vía RustDesk.

### Paso 2: Conectarse al servidor

Conéctate al Dell vía RustDesk y abre una terminal.

### Paso 3: Ejecutar despliegue automático

```bash
cd /home/claude/intranet

# Descomprimir el código actualizado
tar -xzf intranet-actualizado.tar.gz

# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar el script de despliegue
./deploy.sh
```

El script hará automáticamente:
- ✅ Backup del código actual
- ✅ Parar el contenedor web
- ✅ Rebuild del contenedor
- ✅ Levantar el contenedor web
- ✅ Verificar el estado

### Paso 4: Verificar

Abre el navegador y ve a: `https://intranet.iesfelixdeazara.com`

---

## 🔧 Opción B: Despliegue Manual

Si prefieres hacerlo paso a paso:

```bash
cd /home/claude/intranet

# 1. Backup (opcional pero recomendado)
cp -r apps apps.backup-$(date +%Y%m%d-%H%M%S)

# 2. Descomprimir código actualizado
tar -xzf intranet-actualizado.tar.gz

# 3. Parar contenedor web
docker compose stop web

# 4. Rebuild del contenedor web
docker compose build web

# 5. Levantar contenedor web
docker compose up -d web

# 6. Ver logs para verificar
docker compose logs -f web
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar contenedores

```bash
docker compose ps
```

Deberías ver 5 contenedores corriendo (todos "Up").

### 2. Verificar logs

```bash
docker compose logs web --tail=50
```

Busca la línea: `Listening on http://0.0.0.0:3001`

No debe haber errores en rojo.

### 3. Probar en el navegador

1. Abre `https://intranet.iesfelixdeazara.com`
2. Login con tu cuenta @iesfelixdeazara.com
3. Navega a "Incidencias TIC"
4. Crea una incidencia de prueba
5. Verifica que funciona correctamente

---

## 🆘 Troubleshooting

### El contenedor web no arranca

```bash
# Ver logs detallados
docker compose logs web

# Reiniciar todo
docker compose down
docker compose up -d
```

### La página no carga

```bash
# Verificar que todos los contenedores están corriendo
docker compose ps

# Ver logs de Traefik
docker compose logs traefik
```

### Errores de "Failed to fetch"

```bash
# Rebuild completo del web
docker compose stop web
docker compose build --no-cache web
docker compose up -d web
```

---

## 📋 Checklist Completo

- [ ] Archivos copiados al servidor
- [ ] `tar -xzf intranet-actualizado.tar.gz` ejecutado
- [ ] Script `deploy.sh` ejecutado (o pasos manuales)
- [ ] 5 contenedores corriendo: `docker compose ps`
- [ ] Logs sin errores: `docker compose logs web`
- [ ] Página web accesible: `https://intranet.iesfelixdeazara.com`
- [ ] Login con Google funciona
- [ ] Módulo de incidencias carga correctamente
- [ ] Puedes crear una incidencia de prueba

---

## 📞 Si Necesitas Ayuda

Si algo no funciona:

1. Captura la salida de: `docker compose ps`
2. Captura los logs: `docker compose logs > logs.txt`
3. Documenta qué paso falló exactamente

Consulta `TESTING.md` para una guía completa de verificación.
