#!/bin/bash

# Script de Instalação Automatizada - Sistema de Estacionamento 2º BEC
# Autor: Sistema Automatizado
# Data: $(date +%Y-%m-%d)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Use um usuário com sudo."
fi

# Verificar se sudo está disponível
if ! command -v sudo &> /dev/null; then
    error "sudo não está instalado. Instale sudo primeiro."
fi

log "=== INICIANDO INSTALAÇÃO DO SISTEMA 2º BEC ==="

# Configurações
DB_NAME="estacionamento_2bec"
DB_USER="2bec_user"
DB_PASS="2BEC@$(date +%Y)#Secure"
APP_DIR="/var/www/est_2bec"
DOMAIN="estacionamento.2bec.mil.br"
BACKUP_DIR="/backup/2bec"

log "Configurações:"
info "Banco de dados: $DB_NAME"
info "Usuário DB: $DB_USER"
info "Diretório da aplicação: $APP_DIR"
info "Domínio: $DOMAIN"

read -p "Pressione Enter para continuar ou Ctrl+C para cancelar..."

# 1. Atualizar sistema
log "1. Atualizando sistema operacional..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências básicas
log "2. Instalando dependências básicas..."
sudo apt install -y curl wget git nginx mysql-server ufw fail2ban htop unzip

# 3. Configurar firewall
log "3. Configurando firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 4. Instalar Node.js
log "4. Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Instalar PM2
log "5. Instalando PM2..."
sudo npm install -g pm2

# 6. Configurar MySQL
log "6. Configurando MySQL..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';"
sudo mysql -u root -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -u root -p$DB_PASS -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -u root -p$DB_PASS -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -u root -p$DB_PASS -e "FLUSH PRIVILEGES;"

# 7. Criar estrutura do banco
log "7. Criando estrutura do banco de dados..."
if [ -f "database_complete.sql" ]; then
    # Substituir nome do banco no arquivo SQL
    sed "s/estacionamento_2bec/$DB_NAME/g" database_complete.sql > /tmp/db_setup.sql
    sudo mysql -u root -p$DB_PASS < /tmp/db_setup.sql
    rm /tmp/db_setup.sql
    log "Estrutura do banco criada com sucesso!"
else
    warning "Arquivo database_complete.sql não encontrado. Execute manualmente."
fi

# 8. Preparar diretório da aplicação
log "8. Preparando diretório da aplicação..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 9. Copiar arquivos da aplicação
log "9. Copiando arquivos da aplicação..."
if [ -d "$(pwd)" ] && [ -f "package.json" ]; then
    cp -r . $APP_DIR/
    cd $APP_DIR
else
    error "Execute este script no diretório raiz do projeto (onde está o package.json)"
fi

# 10. Instalar dependências da aplicação
log "10. Instalando dependências da aplicação..."
npm install

# 11. Configurar variáveis de ambiente
log "11. Configurando variáveis de ambiente..."
cat > .env.local << EOF
# Database
DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"

# Next.js
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# App
NODE_ENV="production"
EOF

# 12. Build da aplicação
log "12. Fazendo build da aplicação..."
npm run build

# 13. Configurar PM2
log "13. Configurando PM2..."
pm2 delete 2bec-estacionamento 2>/dev/null || true
pm2 start npm --name "2bec-estacionamento" -- start
pm2 startup
pm2 save

# 14. Configurar Nginx
log "14. Configurando Nginx..."
sudo tee /etc/nginx/sites-available/2bec-estacionamento > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL Configuration (certificado auto-assinado temporário)
    ssl_certificate /etc/ssl/certs/2bec-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/2bec-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

# 15. Criar certificado SSL auto-assinado temporário
log "15. Criando certificado SSL temporário..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/2bec-selfsigned.key \
    -out /etc/ssl/certs/2bec-selfsigned.crt \
    -subj "/C=BR/ST=PI/L=Teresina/O=2BEC/OU=TI/CN=$DOMAIN"

# 16. Ativar site no Nginx
log "16. Ativando site no Nginx..."
sudo ln -sf /etc/nginx/sites-available/2bec-estacionamento /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 17. Configurar backup automatizado
log "17. Configurando backup automatizado..."
sudo mkdir -p $BACKUP_DIR
sudo tee /usr/local/bin/backup-2bec.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="$BACKUP_DIR"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup do banco
mysqldump -u $DB_USER -p'$DB_PASS' $DB_NAME > \$BACKUP_DIR/db_\$DATE.sql

# Backup da aplicação
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz $APP_DIR

# Manter apenas 7 dias
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: \$DATE"
EOF

sudo chmod +x /usr/local/bin/backup-2bec.sh

# Adicionar ao cron
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-2bec.sh >> /var/log/backup-2bec.log 2>&1") | sudo crontab -

# 18. Configurar logs
log "18. Configurando rotação de logs..."
sudo tee /etc/logrotate.d/2bec-estacionamento > /dev/null << EOF
/var/log/backup-2bec.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# 19. Configurar fail2ban para Nginx
log "19. Configurando fail2ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
EOF

sudo systemctl restart fail2ban

# 20. Finalização
log "20. Finalizando instalação..."

# Verificar serviços
sudo systemctl enable nginx
sudo systemctl enable mysql
sudo systemctl enable fail2ban

log "=== INSTALAÇÃO CONCLUÍDA COM SUCESSO! ==="
echo ""
info "Informações importantes:"
info "- URL do sistema: https://$DOMAIN"
info "- Usuário admin padrão: admin / admin123"
info "- Usuário comum padrão: usuario / user123"
info "- Banco de dados: $DB_NAME"
info "- Usuário do banco: $DB_USER"
info "- Senha do banco: $DB_PASS"
info "- Diretório da aplicação: $APP_DIR"
info "- Diretório de backup: $BACKUP_DIR"
echo ""
warning "IMPORTANTE:"
warning "1. Altere as senhas padrão imediatamente"
warning "2. Configure certificado SSL válido"
warning "3. Configure DNS para apontar para este servidor"
warning "4. Teste todas as funcionalidades"
echo ""
info "Comandos úteis:"
info "- Ver logs da aplicação: pm2 logs 2bec-estacionamento"
info "- Reiniciar aplicação: pm2 restart 2bec-estacionamento"
info "- Ver status: pm2 status"
info "- Backup manual: sudo /usr/local/bin/backup-2bec.sh"
echo ""
log "Sistema pronto para uso!"
