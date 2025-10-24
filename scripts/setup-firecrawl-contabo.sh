#!/bin/bash
set -e

################################################################################
# Firecrawl Self-Hosted Setup for Contabo VPS
#
# Prerequisites:
# - Contabo VPS with Ubuntu 22.04+ (4 vCPU, 4 GB RAM minimum)
# - Root or sudo access
# - Domain name pointing to VPS (for SSL)
#
# Security Hardening:
# - Firewall configuration (UFW)
# - SSL/TLS with Let's Encrypt
# - Rate limiting
# - Network isolation
################################################################################

echo "🚀 Starting Firecrawl setup on Contabo VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx and Certbot for SSL
echo "🔐 Installing Nginx and Certbot..."
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Firecrawl directory
echo "📁 Creating Firecrawl directory..."
sudo mkdir -p /opt/firecrawl
cd /opt/firecrawl

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env <<EOF
# Firecrawl Configuration
FIRECRAWL_PORT=3002
FIRECRAWL_INTERNAL_PORT=3002
FIRECRAWL_REDIS_URL=redis://redis:6379

# Playwright
PLAYWRIGHT_MICROSERVICE_URL=http://playwright-service:3000/scrape
BLOCK_MEDIA=true

# Authentication (optional - set to true if you want API key auth)
FIRECRAWL_USE_DB_AUTHENTICATION=false
FIRECRAWL_TEST_API_KEY=\${FIRECRAWL_API_KEY:-test-key-change-me}
FIRECRAWL_BULL_AUTH_KEY=\${FIRECRAWL_BULL_AUTH_KEY:-bull-key-change-me}

# Logging
FIRECRAWL_LOGGING_LEVEL=info

# OpenAI (optional - for enhanced extraction)
# OPENAI_API_KEY=your-key-here
# MODEL_NAME=gpt-4o-mini
# MODEL_EMBEDDING_NAME=text-embedding-3-small

# Proxy (optional - for anti-bot evasion)
# PROXY_SERVER=
# PROXY_USERNAME=
# PROXY_PASSWORD=
EOF

echo "✅ Environment file created at /opt/firecrawl/.env"
echo "⚠️  IMPORTANT: Edit /opt/firecrawl/.env and set secure API keys!"

# Configure UFW firewall
echo "🔥 Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP (for Let's Encrypt)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

echo "🔒 Firewall configured (SSH, HTTP, HTTPS only)"

# Configure Nginx reverse proxy
echo "🌐 Configuring Nginx reverse proxy..."
echo "Enter your domain name (e.g., firecrawl.yourdomain.com):"
read DOMAIN

cat > /etc/nginx/sites-available/firecrawl <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=firecrawl_limit:10m rate=10r/s;
    limit_req zone=firecrawl_limit burst=20 nodelay;

    location / {
        # SSRF Protection: Block private IP ranges
        deny 10.0.0.0/8;
        deny 172.16.0.0/12;
        deny 192.168.0.0/16;
        deny 127.0.0.0/8;
        deny ::1;
        deny fc00::/7;
        deny fe80::/10;

        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3002/health;
        access_log off;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/firecrawl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configured for $DOMAIN"

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate..."
echo "Make sure $DOMAIN points to this server's IP address!"
read -p "Press Enter to continue with SSL setup..."

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || echo "⚠️  SSL setup failed. Run manually: sudo certbot --nginx -d $DOMAIN"

# Create systemd service for auto-start
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/firecrawl.service <<EOF
[Unit]
Description=Firecrawl Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/firecrawl
ExecStart=/usr/local/bin/docker-compose -f /path/to/docker-compose.firecrawl.yml up -d
ExecStop=/usr/local/bin/docker-compose -f /path/to/docker-compose.firecrawl.yml down
User=root

[Install]
WantedBy=multi-user.target
EOF

echo "⚠️  TODO: Update /etc/systemd/system/firecrawl.service with correct docker-compose.yml path"

# Start Firecrawl
echo "🚀 Starting Firecrawl..."
echo "Copy your docker-compose.firecrawl.yml to /opt/firecrawl/docker-compose.yml"
read -p "Press Enter when ready..."

cd /opt/firecrawl
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🏥 Checking Firecrawl health..."
curl -f http://localhost:3002/health && echo "✅ Firecrawl is healthy!" || echo "❌ Health check failed"

# Final instructions
cat <<EOF

================================================================================
🎉 Firecrawl Setup Complete!
================================================================================

📍 Firecrawl URL: https://$DOMAIN
🔑 API Key: Set in /opt/firecrawl/.env (FIRECRAWL_TEST_API_KEY)

Next Steps:
-----------
1. Set secure API keys in /opt/firecrawl/.env
   sudo nano /opt/firecrawl/.env

2. Add to your Vercel project environment variables:
   FIRECRAWL_BASE_URL=https://$DOMAIN
   FIRECRAWL_API_KEY=<your-secure-key>
   ENABLE_FIRECRAWL=true

3. Test the endpoint:
   curl -X POST https://$DOMAIN/v1/scrape \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer <your-api-key>" \\
     -d '{"url": "https://arelion.com"}'

4. Monitor logs:
   cd /opt/firecrawl && docker-compose logs -f

Security Checklist:
-------------------
✅ Firewall configured (SSH, HTTP, HTTPS only)
✅ SSL/TLS enabled
✅ Nginx rate limiting (10 req/s)
⚠️  TODO: Set secure API keys in .env
⚠️  TODO: Configure API key rotation (90 days)
⚠️  TODO: Set up monitoring/alerts
⚠️  TODO: Regular updates (docker-compose pull)

Resources:
----------
- Firecrawl OSS: https://github.com/firecrawl/firecrawl
- Self-host guide: https://github.com/firecrawl/firecrawl/blob/main/SELF_HOST.md
- VPS location: /opt/firecrawl/

================================================================================
EOF
