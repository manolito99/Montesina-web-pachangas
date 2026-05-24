#!/usr/bin/env bash
# ============================================================
# First-time setup for Montesiña Padel on the production server.
# Usage:
#   scp scripts/setup-server.sh ubuntu@143.47.45.225:~
#   ssh ubuntu@143.47.45.225 'chmod +x setup-server.sh && ./setup-server.sh'
# ============================================================
set -euo pipefail

REPO_DIR="$HOME/Montesina-web-pachangas"
REPO_URL="git@github.com:manolito99/Montesina-web-pachangas.git"

echo "=== 1. Clone repository ==="
if [ -d "$REPO_DIR" ]; then
  echo "Repository already exists at $REPO_DIR"
  cd "$REPO_DIR" && git pull origin master
else
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

echo "=== 2. Create .env from template ==="
if [ ! -f "$REPO_DIR/.env" ]; then
  cp "$REPO_DIR/.env.production.example" "$REPO_DIR/.env"
  echo ""
  echo "!!! IMPORTANT: Edit $REPO_DIR/.env with real production values !!!"
  echo "    nano $REPO_DIR/.env"
  echo ""
  echo "Generate secrets with:"
  echo "  openssl rand -base64 32    # NEXTAUTH_SECRET"
  echo "  openssl rand -base64 32    # POSTGRES_PASSWORD"
  echo ""
  exit 0
else
  echo ".env already exists"
fi

echo "=== 3. Ensure proxy-net network exists ==="
docker network inspect proxy-net >/dev/null 2>&1 || docker network create proxy-net

echo "=== 4. Build and start ==="
cd "$REPO_DIR"
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d db
echo "Waiting for database to be ready..."
sleep 8
docker compose -f docker-compose.prod.yml run --rm -T web npx prisma migrate deploy
docker compose -f docker-compose.prod.yml run --rm -T web npx prisma db seed
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "============================================"
echo "  Montesiña setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Configure SSL in the proxy (see ~/proxy/init-ssl.sh)"
echo "  2. Verify: curl http://localhost:3000/api/health"
echo "  3. Configure GitHub Secrets (SSH_HOST, SSH_USER, SSH_KEY)"
echo ""
echo "Check status: cd $REPO_DIR && docker compose -f docker-compose.prod.yml ps"
echo "View logs:    cd $REPO_DIR && docker compose -f docker-compose.prod.yml logs -f web"
echo ""
