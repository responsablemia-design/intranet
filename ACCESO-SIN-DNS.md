# 🌐 Acceso Sin DNS - Intranet IES Félix de Azara

## Problema
Sin DNS configurado, el dominio `intranet.iesfelixdeazara.com` no resuelve a la IP del servidor.

## ✅ Solución Recomendada: Editar archivo hosts

Esta es la forma más limpia y no requiere cambiar la configuración del servidor.

### Windows

1. **Abre Notepad como Administrador**
   - Clic derecho en el menú inicio → Buscar "Notepad"
   - Clic derecho → "Ejecutar como administrador"

2. **Abre el archivo hosts**
   - Archivo → Abrir
   - Navega a: `C:\Windows\System32\drivers\etc\`
   - Cambia el filtro de "Documentos de texto" a "Todos los archivos"
   - Selecciona `hosts` y abre

3. **Añade esta línea al final**
   ```
   172.30.200.240    intranet.iesfelixdeazara.com
   ```

4. **Guarda** (Ctrl+S)

5. **Limpia la caché DNS** (opcional pero recomendado)
   ```cmd
   ipconfig /flushdns
   ```

### Linux / Mac

```bash
sudo nano /etc/hosts
```

Añade esta línea al final:
```
172.30.200.240    intranet.iesfelixdeazara.com
```

Guarda (Ctrl+O, Enter, Ctrl+X)

### Resultado

Ahora podrás acceder normalmente a:
```
https://intranet.iesfelixdeazara.com
```

Tu navegador usará la IP `172.30.200.240` automáticamente.

---

## ⚠️ Alternativa: Acceso Directo por IP (puede no funcionar)

### Opción A: HTTP directo (sin SSL)

```
http://172.30.200.240
```

**Problema:** Traefik redirige automáticamente a HTTPS, y sin certificado válido para la IP, tendrás advertencias de seguridad.

### Opción B: HTTPS con advertencia

```
https://172.30.200.240
```

El navegador mostrará una advertencia de certificado no válido (porque el certificado es para `intranet.iesfelixdeazara.com`, no para la IP).

**Para continuar:**
1. Clic en "Avanzado"
2. Clic en "Continuar a 172.30.200.240 (no seguro)"

**Limitación:** Algunas funcionalidades pueden no funcionar correctamente sin el dominio correcto.

---

## 🔧 Opción Avanzada: Modificar Traefik (NO recomendado)

Si realmente necesitas acceder por IP sin tocar el archivo hosts, puedes modificar temporalmente el `docker-compose.yml`:

### Cambios en el servidor Dell

```bash
cd /home/claude/intranet
nano docker-compose.yml
```

**Busca las líneas en el servicio `api`:**
```yaml
- traefik.http.routers.api.rule=Host(`intranet.${DOMAIN}`) && PathPrefix(`/api`, `/auth`)
```

**Reemplaza por:**
```yaml
- traefik.http.routers.api.rule=PathPrefix(`/api`, `/auth`)
```

**Busca las líneas en el servicio `web`:**
```yaml
- traefik.http.routers.web.rule=Host(`intranet.${DOMAIN}`)
```

**Reemplaza por:**
```yaml
- traefik.http.routers.web.rule=PathPrefix(`/`)
```

**Reinicia los servicios:**
```bash
docker compose down
docker compose up -d
```

**Ahora podrás acceder por:**
```
http://172.30.200.240
```

⚠️ **IMPORTANTE:** Esto es temporal. Una vez configures el DNS en Ionos, debes revertir estos cambios y volver a la configuración original.

---

## 📝 Resumen

| Método | Dificultad | Recomendado | Notas |
|--------|-----------|-------------|-------|
| **Editar hosts** | Fácil | ✅ SÍ | Solución limpia, no toca el servidor |
| **IP directa** | Muy fácil | ⚠️ Puede no funcionar | Problemas con SSL y routing |
| **Modificar Traefik** | Media | ❌ NO | Requiere revertir cambios después |

## 🎯 Recomendación Final

1. **Para probar ahora:** Edita el archivo hosts en tu máquina local
2. **Para producción:** Configura el DNS en Ionos apuntando a `172.30.200.240`

El archivo hosts te permite probar todo como si el DNS ya estuviera configurado, sin tocar nada en el servidor.
