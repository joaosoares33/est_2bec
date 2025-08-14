#!/bin/bash

# Script de Atualização - Sistema 2º BEC
# Execute este script para atualizar o sistema

set -e

GREEN='\033[0;32m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

APP_DIR="/var/www/est_2bec"

log "=== ATUALIZANDO SISTEMA 2º BEC ==="

# Ir para diretório da aplicação
cd $APP_DIR

# Fazer backup antes da atualização
log "Fazendo backup antes da atualização..."
sudo /usr/local/bin/backup-2bec.sh

# Atualizar código
log "Atualizando código..."
git pull origin main

# Instalar dependências
log "Instalando dependências..."
npm install

# Build da aplicação
log "Fazendo build..."
npm run build

# Reiniciar aplicação
log "Reiniciando aplicação..."
pm2 restart 2bec-estacionamento

log "Atualização concluída!"
