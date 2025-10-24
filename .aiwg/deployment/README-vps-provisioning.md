# Contabo VPS Provisioning Guide for Zero Noise

This guide walks through provisioning a Contabo VPS for self-hosted Firecrawl deployment.

## Prerequisites

- Contabo account (create at https://contabo.com)
- Domain name for DNS configuration
- SSH client installed locally
- Basic Linux command-line knowledge

## Step 1: Order Contabo VPS

### 1.1 Select VPS Plan

Recommended configuration for Firecrawl:

**VPS M Plan**:
- **CPU**: 4 vCPU cores
- **RAM**: 8 GB
- **Storage**: 200 GB NVMe SSD
- **Bandwidth**: 32 TB/month
- **Price**: ~€8.99/month

**Why this configuration**:
- Firecrawl requires 2-4 GB RAM for browser automation
- 4 CPU cores handle concurrent scraping requests
- 200 GB storage for Docker images, cache, logs
- More than sufficient bandwidth for scraping workloads

### 1.2 Configuration Options

1. Go to https://contabo.com/en/vps/
2. Select **VPS M** plan
3. Configure options:
   - **Region**: Choose closest to your users (US East, EU, Asia)
   - **OS**: Ubuntu 22.04 LTS (recommended)
   - **Period**: 1 month (test first) or 6 months (10% discount)
   - **Additional IPs**: Not needed
   - **Backups**: Optional (€1/month) - recommended for production
4. Add to cart and checkout

### 1.3 After Order Confirmation

Within 24 hours, you'll receive:
- **Email**: VPS credentials and IP address
- **Control Panel**: Access to Customer Control Panel (CCP)
- **IP Address**: Public IPv4 address for your VPS

**Save these credentials securely** (use password manager).

## Step 2: Initial VPS Access

### 2.1 SSH Access

From the email, you'll have:
- **IP Address**: `<VPS_IP>`
- **Username**: `root`
- **Password**: `<initial_password>`

Connect via SSH:

```bash
ssh root@<VPS_IP>
```

Enter the password when prompted. You should see Ubuntu welcome message.

### 2.2 Change Root Password (Critical)

**Immediately** change the root password:

```bash
passwd
```

Enter a strong password (20+ characters, mix of upper/lower/numbers/symbols).

### 2.3 Update System

Update all packages to latest versions:

```bash
apt update && apt upgrade -y
```

This may take 5-10 minutes. Reboot if kernel was updated:

```bash
reboot
```

Wait 2 minutes, then reconnect via SSH.

## Step 3: Security Hardening

### 3.1 Create Non-Root User

**Never run services as root**. Create a dedicated user:

```bash
# Create user
adduser firecrawl

# Add to sudo group
usermod -aG sudo firecrawl

# Test sudo access
su - firecrawl
sudo ls /root  # Should work after entering password
exit
```

### 3.2 Configure SSH Key Authentication

**On your local machine** (not VPS):

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to VPS
ssh-copy-id firecrawl@<VPS_IP>

# Test SSH key login
ssh firecrawl@<VPS_IP>  # Should work without password
```

### 3.3 Disable Password Authentication

**On VPS** (as root or firecrawl with sudo):

```bash
sudo nano /etc/ssh/sshd_config
```

Find and modify these lines:

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

Save (Ctrl+O, Enter) and exit (Ctrl+X).

Restart SSH service:

```bash
sudo systemctl restart sshd
```

**Test** in a new terminal before closing your current session:

```bash
ssh firecrawl@<VPS_IP>  # Should work with key
ssh root@<VPS_IP>       # Should be denied
```

### 3.4 Configure Firewall (UFW)

Set up basic firewall rules:

```bash
# Enable firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (port 22)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Firecrawl API (port 3002)
sudo ufw allow 3002/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 3.5 Install Fail2Ban

Protect against brute-force SSH attacks:

```bash
sudo apt install fail2ban -y

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status sshd
```

## Step 4: Install Docker

### 4.1 Install Docker Engine

```bash
# Install dependencies
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 4.2 Configure Docker for Non-Root User

```bash
# Add firecrawl user to docker group
sudo usermod -aG docker firecrawl

# Log out and back in for group changes to take effect
exit
ssh firecrawl@<VPS_IP>

# Test Docker without sudo
docker ps  # Should work without permission error
```

## Step 5: DNS Configuration

### 5.1 Create A Record

In your DNS provider (Cloudflare, Namecheap, etc.):

1. Go to DNS management for your domain
2. Add A record:
   - **Type**: A
   - **Name**: `firecrawl` (or subdomain of choice)
   - **Value**: `<VPS_IP>` (your Contabo VPS IP)
   - **TTL**: 300 (5 minutes) for testing, 3600 (1 hour) for production

Example:
```
firecrawl.yourdomain.com → 123.456.789.012
```

### 5.2 Verify DNS Propagation

Wait 5-10 minutes, then test:

```bash
# From local machine
nslookup firecrawl.yourdomain.com

# Should return your VPS IP
# If not, wait longer (DNS can take up to 24 hours)
```

## Step 6: Install SSL Certificate

### 6.1 Install Certbot

```bash
# On VPS
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Option A: Standalone Certificate (No Web Server)

If you'll run Firecrawl without nginx reverse proxy:

```bash
# Stop any service on port 80
sudo systemctl stop nginx  # If nginx installed

# Generate certificate
sudo certbot certonly --standalone -d firecrawl.yourdomain.com

# Follow prompts:
# - Enter email for renewal notifications
# - Agree to terms of service
# - Share email with EFF (optional)

# Certificates will be saved to:
# /etc/letsencrypt/live/firecrawl.yourdomain.com/
```

### 6.3 Option B: Nginx Reverse Proxy (Recommended)

```bash
# Install nginx
sudo apt install nginx -y

# Create nginx config for Firecrawl
sudo nano /etc/nginx/sites-available/firecrawl
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name firecrawl.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings for long-running scrapes
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable site and get SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/firecrawl /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d firecrawl.yourdomain.com

# Follow prompts, certbot will auto-configure nginx for HTTPS
```

### 6.4 Test SSL

```bash
# Should redirect to HTTPS and show valid certificate
curl -I https://firecrawl.yourdomain.com
```

### 6.5 Auto-Renewal Setup

Certbot automatically creates a renewal cron job. Verify:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Should show "Congratulations, all simulated renewals succeeded"
```

## Step 7: Monitoring and Logging

### 7.1 Install Monitoring Tools

```bash
# Install htop for system monitoring
sudo apt install htop -y

# Install disk usage analyzer
sudo apt install ncdu -y

# Check system resources
htop  # Press q to quit
df -h  # Disk usage
free -h  # Memory usage
```

### 7.2 Configure Log Rotation

Docker generates large logs. Configure log rotation:

```bash
sudo nano /etc/docker/daemon.json
```

Add:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### 7.3 Set Up Logwatch (Optional)

Get daily email summaries of system logs:

```bash
sudo apt install logwatch -y

# Configure email
sudo nano /etc/logwatch/conf/logwatch.conf

# Set:
# MailTo = your_email@example.com
# MailFrom = logwatch@yourdomain.com

# Test
sudo logwatch --output mail --format html --range today
```

## Step 8: Backup Configuration

### 8.1 Enable Contabo Backups

1. Log in to Contabo Customer Control Panel
2. Go to your VPS
3. Enable "Automated Backups" (€1/month)
4. Backups run daily at 2 AM UTC

### 8.2 Configure Docker Volume Backups

Create backup script:

```bash
sudo nano /usr/local/bin/backup-firecrawl.sh
```

```bash
#!/bin/bash
# Firecrawl Docker Volume Backup Script

BACKUP_DIR="/backups/firecrawl"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm \
  -v firecrawl_data:/data \
  -v $BACKUP_DIR:/backup \
  ubuntu tar czf /backup/firecrawl-data-$DATE.tar.gz /data

# Keep only last 7 days of backups
find $BACKUP_DIR -name "firecrawl-data-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/firecrawl-data-$DATE.tar.gz"
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/backup-firecrawl.sh
```

Schedule daily backups:

```bash
sudo crontab -e

# Add line (run daily at 3 AM):
0 3 * * * /usr/local/bin/backup-firecrawl.sh >> /var/log/firecrawl-backup.log 2>&1
```

## Step 9: Performance Tuning

### 9.1 Optimize Swap

For 8 GB RAM, configure swap:

```bash
# Check current swap
free -h

# Create 4 GB swap file
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make persistent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize swappiness (use swap less aggressively)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 9.2 Optimize Docker

```bash
sudo nano /etc/docker/daemon.json
```

Add performance settings:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-address-pools": [
    {
      "base": "172.80.0.0/16",
      "size": 24
    }
  ]
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

## Step 10: VPS Readiness Checklist

Before deploying Firecrawl, verify:

- [ ] VPS accessible via SSH with key authentication
- [ ] Root login disabled
- [ ] Firewall configured (ports 22, 80, 443, 3002 open)
- [ ] Fail2Ban running
- [ ] Docker installed and working without sudo
- [ ] DNS A record pointing to VPS IP
- [ ] SSL certificate installed and valid
- [ ] Nginx reverse proxy configured (if using Option B)
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Swap configured
- [ ] Monitoring tools installed

**Verify checklist**:

```bash
# SSH
ssh firecrawl@<VPS_IP>  # Should work without password

# Firewall
sudo ufw status  # Should show active with rules

# Docker
docker ps  # Should work without sudo

# DNS
nslookup firecrawl.yourdomain.com  # Should return VPS IP

# SSL
curl -I https://firecrawl.yourdomain.com  # Should return 502 (no backend yet) with valid SSL

# Disk space
df -h  # Should have >100 GB free

# Memory
free -h  # Should show ~8 GB RAM + 4 GB swap
```

## Next Steps

Once VPS provisioning is complete, proceed to:

1. **US-4.10**: Deploy Firecrawl to production VPS
   - Follow `README-firecrawl-deployment.md`
   - Test scraping functionality
   - Configure API key for Zero Noise integration

2. **US-4.11**: Deploy Sprint 4 features to Vercel
   - Set environment variables (FIRECRAWL_BASE_URL, FIRECRAWL_API_KEY)
   - Deploy to production
   - Run smoke tests

## Troubleshooting

### Can't SSH to VPS

**Fixes**:
1. Verify IP address is correct (check Contabo control panel)
2. Check SSH service: `sudo systemctl status sshd`
3. Temporarily allow password auth for debugging
4. Check firewall: `sudo ufw status`
5. Contact Contabo support if VPS is unreachable

### DNS Not Resolving

**Fixes**:
1. Wait longer (DNS can take up to 24 hours)
2. Check A record in DNS provider dashboard
3. Test with different DNS servers: `dig @8.8.8.8 firecrawl.yourdomain.com`
4. Flush local DNS cache: `sudo systemd-resolve --flush-caches`

### SSL Certificate Failed

**Fixes**:
1. Verify DNS resolves to VPS IP
2. Check port 80 is open: `sudo ufw status | grep 80`
3. Stop nginx: `sudo systemctl stop nginx`
4. Retry certbot standalone: `sudo certbot certonly --standalone -d firecrawl.yourdomain.com`
5. Check certbot logs: `sudo cat /var/log/letsencrypt/letsencrypt.log`

### Out of Disk Space

**Fixes**:
1. Check Docker disk usage: `docker system df`
2. Prune unused images: `docker system prune -a`
3. Check log files: `sudo du -sh /var/log/*`
4. Rotate logs: `sudo logrotate -f /etc/logrotate.conf`

## Support Resources

- **Contabo Support**: https://contabo.com/en/support/
- **Ubuntu Documentation**: https://help.ubuntu.com/
- **Docker Documentation**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/

## Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade` weekly
2. **Monitor logs**: `sudo tail -f /var/log/auth.log` for suspicious activity
3. **Review fail2ban**: `sudo fail2ban-client status sshd` for blocked IPs
4. **Change passwords regularly**: Every 90 days minimum
5. **Use SSH keys only**: Never enable password authentication
6. **Backup regularly**: Test restores monthly
7. **Monitor disk usage**: Alert when >80% full
8. **Review open ports**: `sudo ss -tuln` - only necessary ports open

---

**Estimated Time**: 2-3 hours for complete VPS setup

**Cost Summary**:
- VPS M: €8.99/month
- Backups: €1/month (optional)
- Domain: ~€10/year (if purchasing)
- SSL: Free (Let's Encrypt)

**Total**: ~€10/month (~$11 USD/month)
