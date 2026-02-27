#!/bin/bash
# Script de despliegue - Intranet IES Félix de Azara
# Ejecutar en el servidor Dell T-310

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de actualización..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: No se encuentra docker-compose.yml${NC}"
    echo "Por favor, ejecuta este script desde /home/claude/intranet"
    exit 1
fi

echo -e "${YELLOW}📦 Paso 1: Haciendo backup del código actual...${NC}"
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r apps "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup creado en: $BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}📥 Paso 2: Extrayendo archivos actualizados...${NC}"
if [ -f "intranet-actualizado.tar.gz" ]; then
    tar -xzf intranet-actualizado.tar.gz
    echo -e "${GREEN}✅ Archivos extraídos${NC}"
else
    echo -e "${RED}❌ Error: No se encuentra intranet-actualizado.tar.gz${NC}"
    echo "Copia el archivo al directorio /home/claude/intranet antes de ejecutar este script"
    exit 1
fi
echo ""

echo -e "${YELLOW}🛑 Paso 3: Deteniendo contenedor web...${NC}"
docker compose stop web
echo -e "${GREEN}✅ Contenedor web detenido${NC}"
echo ""

echo -e "${YELLOW}🏗️  Paso 4: Rebuilding contenedor web...${NC}"
docker compose build web
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

echo -e "${YELLOW}🚀 Paso 5: Levantando contenedor web...${NC}"
docker compose up -d web
echo -e "${GREEN}✅ Contenedor web iniciado${NC}"
echo ""

echo -e "${YELLOW}⏳ Esperando 5 segundos para que el contenedor inicie...${NC}"
sleep 5
echo ""

echo -e "${YELLOW}📊 Paso 6: Verificando estado de los contenedores...${NC}"
docker compose ps
echo ""

echo -e "${GREEN}✅ ¡Despliegue completado!${NC}"
echo ""
echo "🔍 Verificación:"
echo "   1. Abre: https://intranet.iesfelixdeazara.com"
echo "   2. Inicia sesión con Google"
echo "   3. Ve a Incidencias TIC y prueba crear una incidencia"
echo ""
echo "📋 Ver logs en tiempo real:"
echo "   docker compose logs -f web"
echo ""
echo "🔄 Si algo falla:"
echo "   docker compose down && docker compose up -d"
echo ""
