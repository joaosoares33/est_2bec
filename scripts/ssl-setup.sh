#!/bin/bash

# Script para configurar SSL com certificado próprio
# Execute após obter certificados da OM

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

DOMAIN="estacionamento.2bec.mil.br"

log "=== CONFIGURAÇÃO DE SSL OFICIAL ==="

warning "Certifique-se de ter os arquivos:"
warning "- certificado.crt (certificado da OM)"
warning "- chave-privada.key (chave privada)"

read -p "Caminho para o arquivo do certificado: " CERT_FILE
read -p "Caminho para o arquivo da chave privada: " KEY_FILE

if [ ! -f "$CERT_FILE" ]; then
    echo "Arquivo de certificado não encontrado: $CERT_FILE"
    exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
    echo "Arquivo de chave privada não encontrado: $KEY_FILE"
    exit 1
fi

log "Copiando certificados..."
sudo cp "$CERT_FILE" /etc/ssl/certs/2bec-official.crt
sudo cp "$KEY_FILE" /etc/ssl/private/2bec-official.key

log "Configurando permissões..."
sudo chmod 644 /etc/ssl/certs/2bec-official.crt
sudo chmod 600 /etc/ssl/private/2bec-official.key

log "Atualizando configuração do Nginx..."
sudo sed -i 's/2bec-selfsigned/2bec-official/g' /etc/nginx/sites-available/2bec-estacionamento

log "Testando configuração..."
sudo nginx -t

log "Reiniciando Nginx..."
sudo systemctl restart nginx

log "SSL oficial configurado com sucesso!"
