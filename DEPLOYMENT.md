# 🚀 VPS Deployment Guide (Docker Compose + Nginx)

Detailed guide for deploying the **Networking App Business Card OCR Backend API** on a Virtual Private Server (VPS) using Docker Compose, Nginx, and SSL Let's Encrypt.

---

## 📋 Prerequisites

1. **VPS Instance** (Ubuntu 22.04 LTS / Debian 12 recommended).
2. **Domain Name** (Optional, but recommended for SSL/HTTPS setup).
3. **Open Ports**: Ensure ports `80` (HTTP), `443` (HTTPS), and `22` (SSH) are open in your VPS Firewall / Security Group.

---

## 🛠️ Step 1: Install Docker & Docker Compose on VPS

Log in to your VPS via SSH and run:

```bash
# Update package list and install prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Allow current user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

---

## 📦 Step 2: Clone Repository & Configure Environment

1. Clone your project repository on the VPS:
   ```bash
   git clone https://github.com/your-username/networking-app-aston88.git
   cd networking-app-aston88
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in your production Roboflow credentials:
   ```bash
   nano .env
   ```
   ```env
   ROBOFLOW_API_KEY=your_actual_roboflow_api_key
   ROBOFLOW_WORKSPACE=muhammad-sayyid-tsabit-anfaresi
   ROBOFLOW_WORKFLOW_ID=business-card-information-extractor-1787034042585
   ROBOFLOW_API_URL=https://serverless.roboflow.com
   DATABASE_PATH=/app/data/contacts.db
   ```

---

## 🚢 Step 3: Launch Services with Docker Compose

Build and start the container stack in detached mode:

```bash
docker compose up -d --build
```

Verify that both containers (`api` and `web`) are running:

```bash
docker compose ps
```

View live logs:

```bash
docker compose logs -f
```

At this point, your full-stack application is accessible via your VPS IP:
- **React Frontend Web App**: `http://YOUR_VPS_IP/`
- **Backend API Base**: `http://YOUR_VPS_IP/api/contacts`
- **Interactive Swagger UI**: `http://YOUR_VPS_IP/docs`

---

## 🔒 Step 4: Configure Free SSL (HTTPS) with Let's Encrypt / Certbot

If you have a domain pointed to your VPS IP (e.g. `api.yourdomain.com`):

1. Install Certbot on the host VPS:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. Generate SSL certificate:
   ```bash
   sudo certbot certonly --standalone -d api.yourdomain.com
   ```

3. Update `nginx/default.conf` on your VPS for HTTPS:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name api.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

       client_max_body_size 20M;

       location / {
           root /usr/share/nginx/html;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://api:8000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location ~ ^/(docs|redoc|openapi\.json) {
           proxy_pass http://api:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Mount the Let's Encrypt certificates into the Nginx container by adding volume mounts in `docker-compose.yml`:
   ```yaml
   web:
     volumes:
       - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
       - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

5. Restart the containers:
   ```bash
   docker compose restart web
   ```

---

## 🔄 Maintenance & Useful Commands

- **Stop Services**:
  ```bash
  docker compose down
  ```

- **Re-deploy / Pull Latest Code**:
  ```bash
  git pull origin main
  docker compose up -d --build
  ```

- **Backup SQLite Database**:
  ```bash
  docker compose exec api cp /app/data/contacts.db /app/data/contacts_backup.db
  # Or copy from host volume:
  docker run --rm -v networking-app-aston88_sqlite_data:/data -v $(pwd):/backup alpine cp /data/contacts.db /backup/contacts_backup.db
  ```
