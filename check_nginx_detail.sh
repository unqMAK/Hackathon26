#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔍 Detailed Nginx and Error Investigation ==="

ssh $USER@$HOST "
    echo '=== Nginx Site Configuration ==='
    cat /etc/nginx/sites-enabled/default 2>/dev/null || cat /etc/nginx/sites-enabled/hacksphere 2>/dev/null || ls -la /etc/nginx/sites-enabled/
    
    echo ''
    echo '=== Main Nginx Config ==='
    cat /etc/nginx/nginx.conf | grep -A5 -B5 'client_max_body_size' 2>/dev/null || echo 'client_max_body_size not in main config'
    
    echo ''
    echo '=== Recent Nginx Access Logs with POST to upload ==='
    grep -i 'upload.*POST\|POST.*upload' /var/log/nginx/access.log 2>/dev/null | tail -20 || echo 'No matching access logs'
    
    echo ''
    echo '=== PM2 Error Log (Last 100 lines) ==='
    tail -100 /root/.pm2/logs/hacksphere-api-error.log 2>/dev/null
"
