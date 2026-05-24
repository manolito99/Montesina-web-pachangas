#!/usr/bin/env bash
# ============================================================
# Initialize Let's Encrypt certificates for all domains.
# Run AFTER DNS is pointing to this server.
#
# Usage: bash ~/proxy/init-ssl.sh
# ============================================================
set -euo pipefail

PROXY_DIR="/home/ubuntu/proxy"
COMPOSE="docker compose -f $PROXY_DIR/docker-compose.yml"
EMAIL="motero@swapenergia.com"
DOMAINS=("cellarbarberstudio.com" "pachangasmontesina.cc")

echo "=== Phase 1: Backup real configs, create HTTP-only for ACME ==="
mkdir -p "$PROXY_DIR/conf.d.bak"

for domain in "${DOMAINS[@]}"; do
  short=$(echo "$domain" | cut -d. -f1)
  conf="$PROXY_DIR/conf.d/${short}.conf"

  # Back up existing SSL config
  if [ -f "$conf" ]; then
    cp "$conf" "$PROXY_DIR/conf.d.bak/${short}.conf"
  fi

  # Write temporary HTTP-only config
  cat > "$conf" <<NGINX
server {
    listen 80;
    server_name $domain;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 200 'Waiting for SSL setup...'; add_header Content-Type text/plain; }
}
NGINX
done

echo "=== Phase 2: Start proxy with HTTP-only ==="
$COMPOSE up -d proxy
sleep 3

echo "=== Phase 3: Obtain certificates ==="
for domain in "${DOMAINS[@]}"; do
  echo "--- Requesting cert for $domain ---"
  $COMPOSE run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$domain"
done

echo "=== Phase 4: Restore SSL configs from backup ==="
for domain in "${DOMAINS[@]}"; do
  short=$(echo "$domain" | cut -d. -f1)
  bak="$PROXY_DIR/conf.d.bak/${short}.conf"
  if [ -f "$bak" ]; then
    cp "$bak" "$PROXY_DIR/conf.d/${short}.conf"
  fi
done

echo "=== Phase 5: Reload Nginx with SSL ==="
$COMPOSE exec -T proxy nginx -s reload

echo ""
echo "============================================"
echo "  SSL setup complete!"
echo "============================================"
echo ""
echo "Verify:"
echo "  curl -I https://cellarbarberstudio.com"
echo "  curl -I https://pachangasmontesina.cc"
echo ""
echo "Set up auto-renewal — add to crontab (crontab -e):"
echo "  0 3 * * * docker compose -f /home/ubuntu/proxy/docker-compose.yml run --rm certbot renew --quiet && docker compose -f /home/ubuntu/proxy/docker-compose.yml exec -T proxy nginx -s reload"
echo ""
