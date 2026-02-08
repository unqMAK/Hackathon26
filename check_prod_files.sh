#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔍 Check Production Files ==="

ssh $USER@$HOST "
    echo '--- Frontend dist folder ---'
    ls -la /var/www/hacksphere/dist/ 2>/dev/null || echo 'MISSING: /var/www/hacksphere/dist/'
    
    echo ''
    echo '--- Frontend assets ---'
    ls -la /var/www/hacksphere/dist/assets/*.js 2>/dev/null || echo 'No JS assets in dist/assets'
    
    echo ''
    echo '--- index.html Content ---'
    head -20 /var/www/hacksphere/dist/index.html 2>/dev/null || echo 'index.html MISSING'
    
    echo ''
    echo '--- Check for Display Location in frontend bundle ---'
    grep -l 'Display Location' /var/www/hacksphere/dist/assets/*.js 2>/dev/null && echo 'FOUND!' || echo 'NOT FOUND in any JS file'
"
