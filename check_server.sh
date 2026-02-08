#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🕵️  Server Diagnostic Tool ==="
echo "Note: You will be asked for the SSH password."

ssh $USER@$HOST "
    echo '--- 1. Node/PM2 Processes ---'
    pm2 list
    
    echo ''
    echo '--- 2. Nginx Configuration (looking for root) ---'
    grep -r 'root' /etc/nginx/sites-enabled/ 2>/dev/null || echo 'No Nginx sites enabled found'
    
    echo ''
    echo '--- 3. Check dist/index.html timestamp (if found in PM2 path) ---'
    APP_DIR=\$(pm2 jlist | grep -o '\"pm_cwd\":\"[^\"]*\"' | head -1 | cut -d'\"' -f4)
    if [ ! -z \"\$APP_DIR\" ]; then
        echo \"Found App Dir: \$APP_DIR\"
        ls -la \$APP_DIR/dist/index.html 2>/dev/null
    else
        echo 'Could not determine app directory from PM2'
    fi
"
