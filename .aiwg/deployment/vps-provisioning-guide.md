# Contabo VPS Provisioning Guide

**US-4.9: Provision Contabo VPS for Firecrawl Deployment**

---

## Overview

This guide walks through provisioning a Contabo VPS for deploying the self-hosted Firecrawl instance.

**Estimated Time**: 30 minutes (15 min for provisioning, 15 min for DNS propagation)
**Cost**: ~$8-11/month for VPS M (4 vCPU, 8 GB RAM, 200 GB SSD)

---

## Prerequisites

Before starting, ensure you have:

- [ ] A domain name you control (for DNS configuration)
- [ ] SSH public key generated on your local machine
  ```bash
  # Generate SSH key if you don't have one
  ssh-keygen -t ed25519 -C "your_email@example.com"
  # View your public key
  cat ~/.ssh/id_ed25519.pub
  ```
- [ ] Payment method (credit card or PayPal) for Contabo

---

## Step 1: Order Contabo VPS

1. **Navigate to Contabo**: https://contabo.com/en/
2. **Select VPS M**:
   - Go to: Products → VPS → VPS M
   - Specs: 4 vCPU, 8 GB RAM, 200 GB SSD, Unmetered Traffic
   - Price: ~$8-11/month
3. **Configure VPS**:
   - **Operating System**: Ubuntu 22.04 LTS (64-bit)
   - **Region**: Choose closest to your primary user base (US East, EU, Asia)
   - **Contract Period**: 1 month (no commitment) or 12 months (10% discount)
   - **Hostname**: `firecrawl` (or your preferred name)
4. **Add SSH Key** (Optional but recommended):
   - Paste your SSH public key from `~/.ssh/id_ed25519.pub`
   - This enables key-based authentication immediately
5. **Complete Purchase**:
   - Review order summary
   - Complete payment
   - Check email for order confirmation

---

## Step 2: Wait for VPS Provisioning Email

**Expected Wait Time**: 5-15 minutes

You will receive an email from Contabo with:
- **VPS IP Address**: e.g., `203.0.113.42`
- **Root Password**: Initial password for `root` user
- **VPS Control Panel URL**: To manage your VPS

**Save this email** - you'll need the IP and password for initial SSH access.

---

## Step 3: Initial SSH Access

Once you receive the provisioning email:

```bash
# SSH to VPS using IP address and root password
ssh root@<VPS_IP_ADDRESS>

# Example:
ssh root@203.0.113.42

# Enter the root password from the provisioning email when prompted
```

**First Login Steps**:

```bash
# Update system packages
apt update && apt upgrade -y

# Create a new sudo user (recommended for security)
adduser firecrawl
usermod -aG sudo firecrawl

# Add your SSH public key to the new user
mkdir -p /home/firecrawl/.ssh
echo "<YOUR_SSH_PUBLIC_KEY>" > /home/firecrawl/.ssh/authorized_keys
chown -R firecrawl:firecrawl /home/firecrawl/.ssh
chmod 700 /home/firecrawl/.ssh
chmod 600 /home/firecrawl/.ssh/authorized_keys

# Test SSH access with new user (from a new terminal)
ssh firecrawl@<VPS_IP_ADDRESS>

# If successful, disable root password login (optional but recommended)
# Edit /etc/ssh/sshd_config:
# PermitRootLogin no
# PasswordAuthentication no
systemctl restart sshd
```

---

## Step 4: Configure UFW Firewall

```bash
# Install UFW (if not already installed)
apt install ufw -y

# Allow SSH (IMPORTANT: Do this first to avoid locking yourself out!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Verify firewall status
ufw status verbose
```

**Expected Output**:
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
443/tcp (v6)                ALLOW IN    Anywhere (v6)
```

---

## Step 5: Configure DNS A Record

**Goal**: Point `firecrawl.yourdomain.com` to your VPS IP address.

### Option A: Using Cloudflare (Recommended)

1. **Log in to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. **Select Your Domain**: Click on the domain you want to use
3. **Add DNS Record**:
   - **Type**: A
   - **Name**: `firecrawl`
   - **IPv4 address**: `<VPS_IP_ADDRESS>` (from provisioning email)
   - **Proxy status**: DNS only (gray cloud icon)
   - **TTL**: Auto
   - Click **Save**

### Option B: Using Your Domain Registrar (e.g., Namecheap, GoDaddy)

1. **Log in to your domain registrar**
2. **Navigate to DNS Management** for your domain
3. **Add A Record**:
   - **Host**: `firecrawl` (or `@` if using root domain)
   - **Type**: A
   - **Value**: `<VPS_IP_ADDRESS>`
   - **TTL**: 300 (5 minutes)
   - Click **Save**

---

## Step 6: Verify DNS Propagation

DNS changes can take 5-15 minutes to propagate. Verify using:

```bash
# Check DNS resolution
dig firecrawl.yourdomain.com +short

# Should return your VPS IP address
# Example output:
# 203.0.113.42

# Alternative using nslookup
nslookup firecrawl.yourdomain.com

# Or using host
host firecrawl.yourdomain.com
```

**If DNS doesn't resolve**:
- Wait 5-10 minutes and try again
- Check that your DNS record was saved correctly
- Verify you're using the correct domain name
- Try using a different DNS server: `dig @8.8.8.8 firecrawl.yourdomain.com +short`

---

## Step 7: Install Basic Utilities

```bash
# Install essential tools
apt install -y curl wget git htop net-tools

# Install Docker (required for Firecrawl deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

**Expected Output**:
```
Docker version 27.0.0, build ab123c
Docker Compose version v2.29.0
```

---

## Verification Checklist

Before proceeding to Firecrawl deployment (US-4.10), verify:

- [ ] VPS is accessible via SSH: `ssh firecrawl@<VPS_IP_ADDRESS>`
- [ ] UFW firewall is active with ports 22, 80, 443 open: `ufw status`
- [ ] DNS resolves correctly: `dig firecrawl.yourdomain.com +short` returns VPS IP
- [ ] Docker is installed: `docker --version`
- [ ] Docker Compose is installed: `docker compose version`

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| VPS M (4 vCPU, 8 GB RAM) | $8-11 | Monthly |
| Domain name | $10-15 | Yearly |
| SSL certificate (Let's Encrypt) | Free | - |
| **Total** | **~$8-11/month** | - |

---

## Next Steps

Once VPS provisioning is complete and DNS is verified:

1. **Proceed to US-4.10**: Deploy Firecrawl to production VPS
2. **Run deployment script**: `./scripts/setup-firecrawl-contabo.sh`
3. **Configure SSL**: Let's Encrypt will auto-issue certificate
4. **Test scraping**: Validate Firecrawl is working correctly

---

## Troubleshooting

### SSH Connection Refused

```bash
# Check if SSH service is running on VPS
systemctl status sshd

# If not running, start it
systemctl start sshd
systemctl enable sshd
```

### UFW Blocking SSH

If you accidentally locked yourself out:

1. **Access VPS via Contabo Control Panel** (web-based console)
2. **Disable UFW temporarily**: `ufw disable`
3. **Re-add SSH rule**: `ufw allow 22/tcp`
4. **Re-enable UFW**: `ufw enable`

### DNS Not Resolving

- **Check TTL**: Low TTL (300s) propagates faster than high TTL (3600s)
- **Clear local DNS cache**:
  - macOS: `sudo dscacheutil -flushcache`
  - Windows: `ipconfig /flushdns`
  - Linux: `sudo systemd-resolve --flush-caches`
- **Use different DNS server**: `dig @8.8.8.8 firecrawl.yourdomain.com +short`

---

## Security Recommendations

- [ ] Disable root SSH login after creating sudo user
- [ ] Use SSH key authentication (disable password auth)
- [ ] Enable automatic security updates:
  ```bash
  apt install unattended-upgrades -y
  dpkg-reconfigure --priority=low unattended-upgrades
  ```
- [ ] Install fail2ban to prevent brute-force attacks:
  ```bash
  apt install fail2ban -y
  systemctl enable fail2ban
  systemctl start fail2ban
  ```
- [ ] Set up firewall rules to limit connections per IP

---

## Support

- **Contabo Support**: https://contabo.com/en/support/
- **Contabo Documentation**: https://docs.contabo.com/
- **Zero Noise Deployment Guide**: `./scripts/README-firecrawl-deployment.md`

---

**Document Version**: 1.0
**Last Updated**: 2025-10-23
**Sprint**: Sprint 4 - US-4.9
**Status**: Ready for Manual Execution
