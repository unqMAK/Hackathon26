#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== Check for Export CSV in production bundle ==="

ssh $USER@$HOST "
    grep -l 'Export Flat CSV' /var/www/hacksphere/dist/assets/*.js 2>/dev/null && echo 'FOUND on server!' || echo 'NOT FOUND on server!'
    
    echo ''
    echo '--- Check bundle file timestamp ---'
    ls -la /var/www/hacksphere/dist/assets/index-*.js
"
