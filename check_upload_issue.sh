#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔍 Checking Upload Errors on Production ==="

ssh $USER@$HOST "
    echo '=== PM2 Error Logs (last 50 lines) ==='
    pm2 logs hacksphere-api --err --lines 50 --nostream 2>/dev/null || tail -50 /root/.pm2/logs/hacksphere-api-error.log
    
    echo ''
    echo '=== Nginx Error Logs (if any) ==='
    tail -30 /var/log/nginx/error.log 2>/dev/null || echo 'No nginx error log found'
    
    echo ''
    echo '=== Check Nginx Config for Upload Limits ==='
    grep -r 'client_max_body_size' /etc/nginx/ 2>/dev/null || echo 'No client_max_body_size found in nginx config'
    
    echo ''
    echo '=== Check if uploads directory exists and is writable ==='
    ls -la /var/www/hacksphere/server/public/uploads/ 2>/dev/null || echo 'uploads dir not found'
    ls -la /var/www/hacksphere/server/public/uploads/consent/ 2>/dev/null || echo 'consent dir not found'
"
