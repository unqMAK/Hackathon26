#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔍 Checking Team Approval Errors ==="

ssh $USER@$HOST "
    echo '=== Recent PM2 Logs (last 100 lines) ==='
    pm2 logs hacksphere-api --lines 100 --nostream 2>/dev/null | grep -i 'error\|fail\|approve\|reject' | tail -50
    
    echo ''
    echo '=== PM2 Error Log ==='
    tail -50 /root/.pm2/logs/hacksphere-api-error.log 2>/dev/null
"
