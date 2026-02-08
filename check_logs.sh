#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔍 Checking Server Logs ==="

ssh $USER@$HOST "
    echo '--- PM2 Logs (last 100 lines) ---'
    pm2 logs hacksphere-api --nostream --lines 100
    
    echo ''
    echo '--- Current PM2 Status ---'
    pm2 status
"
