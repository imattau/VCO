#!/bin/bash

# VCO Relay Installer Script
# This script automates the installation and update of the VCO Relay.

set -e

# Configuration
DEFAULT_INSTALL_DIR="/var/www/vco-relay"
DEFAULT_USER="vco"
DEFAULT_DATA_DIR="/var/lib/vco-relay"
DEFAULT_CONFIG_DIR="/etc/vco"
SERVICE_NAME="vco-relay"
GIT_REPO="https://github.com/vco-protocol/vco.git" # Placeholder, will use current dir if not specified

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check for root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Detect OS
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    error "This script only supports Linux"
fi

usage() {
    echo "Usage: $0 [install|update]"
    echo ""
    echo "Commands:"
    echo "  install    Perform a fresh installation"
    echo "  update     Update an existing installation"
    exit 1
}

check_dependencies() {
    log "Checking dependencies..."
    for cmd in node npm git; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is not installed. Please install it first."
        fi
    done
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version 18 or higher is required. Found v$NODE_VERSION"
    fi
}

install() {
    check_dependencies

    # Prompts
    read -p "Install directory [$DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}

    read -p "Domain name (e.g. relay.example.com): " DOMAIN_NAME

    read -p "Run as user [$DEFAULT_USER]: " RUN_USER
    RUN_USER=${RUN_USER:-$DEFAULT_USER}

    # Create user if not exists
    if ! id "$RUN_USER" &>/dev/null; then
        log "Creating system user $RUN_USER..."
        useradd --system --shell /usr/sbin/nologin $RUN_USER
    fi

    # Setup directories
    log "Setting up directories..."
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$DEFAULT_CONFIG_DIR"
    mkdir -p "$DEFAULT_DATA_DIR"
    chown "$RUN_USER":"$RUN_USER" "$DEFAULT_DATA_DIR"

    # Clone/Copy code
    if [ -d "$INSTALL_DIR/.git" ]; then
        warn "Install directory already contains a git repository. Skipping clone."
    else
        log "Cloning repository..."
        # In a real scenario, we'd clone from GIT_REPO. 
        # For this workspace, we'll copy the current directory contents if we are in it.
        if [ -f "package.json" ] && [ -d "packages/vco-relay" ]; then
            log "Copying files from current directory..."
            cp -r . "$INSTALL_DIR"
        else
            git clone "$GIT_REPO" "$INSTALL_DIR"
        fi
    fi

    cd "$INSTALL_DIR"

    log "Installing dependencies and building..."
    npm install
    npm run build

    # Configuration
    CONFIG_FILE="$DEFAULT_CONFIG_DIR/relay.json"
    if [ ! -f "$CONFIG_FILE" ]; then
        log "Generating default configuration..."
        cat > "$CONFIG_FILE" <<EOF
{
  "listenAddrs": ["/ip4/0.0.0.0/udp/4001/quic-v1"],
  "httpPort": 4000,
  "dataDir": "$DEFAULT_DATA_DIR",
  "maxConnections": 256,
  "pow": { "defaultDifficulty": 0, "maxDifficulty": 20, "windowSeconds": 3600 },
  "maxStoreSizeMb": 0
}
EOF
        chown "$RUN_USER":"$RUN_USER" "$CONFIG_FILE"
    else
        warn "Configuration file $CONFIG_FILE already exists. Skipping generation."
    fi

    # Systemd Service
    log "Installing systemd service..."
    cat > "/etc/systemd/system/$SERVICE_NAME.service" <<EOF
[Unit]
Description=VCO Relay Server
After=network.target

[Service]
Type=simple
User=$RUN_USER
Group=$RUN_USER
WorkingDirectory=$INSTALL_DIR
Environment=VCO_CONFIG_PATH=$CONFIG_FILE
ExecStart=$(command -v node) packages/vco-relay/dist/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    systemctl start "$SERVICE_NAME"

    # Reverse Proxy Detection
    detect_reverse_proxy "$DOMAIN_NAME"

    # Verification
    verify_installation
}

update() {
    check_dependencies
    
    # Try to find install dir
    if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
        INSTALL_DIR=$(grep WorkingDirectory "/etc/systemd/system/$SERVICE_NAME.service" | cut -d '=' -f 2)
    else
        read -p "Install directory [$DEFAULT_INSTALL_DIR]: " INSTALL_DIR
        INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}
    fi

    if [ ! -d "$INSTALL_DIR" ]; then
        error "Install directory $INSTALL_DIR not found."
    fi

    log "Updating VCO Relay in $INSTALL_DIR..."
    cd "$INSTALL_DIR"
    
    if [ ! -d ".git" ]; then
        error "Not a git repository. Cannot update automatically."
    fi

    log "Pulling latest changes..."
    git pull

    log "Rebuilding..."
    npm install
    npm run build

    log "Restarting service..."
    systemctl restart "$SERVICE_NAME"

    verify_installation
}

detect_reverse_proxy() {
    local domain=$1
    if [ -z "$domain" ]; then
        warn "No domain name provided. Skipping reverse proxy configuration."
        return
    fi

    # Caddy
    if command -v caddy &> /dev/null; then
        log "Caddy detected."
        CADDYFILE="/etc/caddy/Caddyfile"
        if [ -f "$CADDYFILE" ]; then
            if grep -q "$domain" "$CADDYFILE"; then
                warn "Domain $domain already found in $CADDYFILE. Skipping Caddy config."
            else
                log "Adding Caddy configuration for $domain..."
                cat >> "$CADDYFILE" <<EOF

$domain {
    reverse_proxy localhost:4000
}
EOF
                log "Caddy configuration added for $domain."
                systemctl reload caddy || true
            fi
        fi
    fi

    # Nginx
    if command -v nginx &> /dev/null; then
        log "Nginx detected."
        NGINX_CONF="/etc/nginx/sites-available/$domain"
        if [ -f "$NGINX_CONF" ]; then
            warn "Nginx config for $domain already exists. Skipping."
        else
            log "Creating Nginx configuration for $domain..."
            cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $domain;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
            ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
            log "Nginx configuration created and enabled for $domain."
            systemctl reload nginx || true
        fi
    fi
}

verify_installation() {
    log "Verifying installation..."
    sleep 3
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "${GREEN}VCO Relay service is active.${NC}"
    else
        error "VCO Relay service failed to start. Check 'journalctl -u $SERVICE_NAME' for details."
    fi

    if command -v curl &> /dev/null; then
        if curl -s http://localhost:4000/health | grep -q "OK"; then
            log "${GREEN}VCO Relay health check passed!${NC}"
        else
            warn "VCO Relay health check failed. The service might still be starting or httpPort is blocked."
        fi
    fi
}

# Main
case "$1" in
    install)
        install
        ;;
    update)
        update
        ;;
    *)
        usage
        ;;
esac
