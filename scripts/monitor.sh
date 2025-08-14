#!/bin/bash

# Script de Monitoramento - Sistema 2º BEC

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== MONITOR DO SISTEMA 2º BEC ===${NC}"
echo ""

# Status dos serviços
echo -e "${GREEN}Status dos Serviços:${NC}"
echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Ativo${NC}"
else
    echo -e "${RED}✗ Inativo${NC}"
fi

echo -n "MySQL: "
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✓ Ativo${NC}"
else
    echo -e "${RED}✗ Inativo${NC}"
fi

echo -n "Fail2ban: "
if systemctl is-active --quiet fail2ban; then
    echo -e "${GREEN}✓ Ativo${NC}"
else
    echo -e "${RED}✗ Inativo${NC}"
fi

echo ""

# Status da aplicação
echo -e "${GREEN}Status da Aplicação:${NC}"
pm2 status

echo ""

# Uso de recursos
echo -e "${GREEN}Uso de Recursos:${NC}"
echo "CPU e Memória:"
top -bn1 | grep "Cpu(s)" | awk '{print "CPU: " $2 " " $3 " " $4 " " $5}'
free -h | grep "Mem:" | awk '{print "Memória: " $3 "/" $2 " (" $3/$2*100 "%)"}'

echo ""

# Espaço em disco
echo -e "${GREEN}Espaço em Disco:${NC}"
df -h | grep -E "/$|/var|/backup" | awk '{print $6 ": " $3 "/" $2 " (" $5 ")"}'

echo ""

# Últimos logs
echo -e "${GREEN}Últimos Logs da Aplicação:${NC}"
pm2 logs 2bec-estacionamento --lines 5 --nostream

echo ""

# Conexões ativas
echo -e "${GREEN}Conexões HTTP Ativas:${NC}"
ss -tuln | grep -E ":80|:443" | wc -l | awk '{print "Conexões: " $1}'

echo ""
echo -e "${BLUE}=== FIM DO MONITOR ===${NC}"
