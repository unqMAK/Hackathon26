#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔎 Verify Code on Server ==="
echo "Checking for 'Export Flat CSV' feature in deployed files..."

ssh $USER@$HOST "
    # Define potential paths
    PATHS=('/var/www/hacksphere/dist' '/var/www/hacksphere/server/dist' '/var/www/hacksphere/server/client/dist')
    
    FOUND_PATH=''
    for P in \"\${PATHS[@]}\"; do
        if [ -d \"\$P/assets\" ]; then
            FOUND_PATH=\"\$P\"
            break
        fi
    done

    if [ -z \"\$FOUND_PATH\" ]; then
        echo '❌ Could not find dist/assets folder.'
        exit 1
    fi

    echo \"✅ Checking in: \$FOUND_PATH\"
    
    echo '--- Searching for feature code ---'
    # Search for the specific string identifying the feature
    if grep -r \"Export Flat CSV\" \"\$FOUND_PATH/assets\"; then
        echo \"✅ SUCCESS: Feature code FOUND on server!\"
        echo \"   (Navigate to /admin/users and Hard Refresh)\"
    else
        echo \"❌ FAILURE: Feature code NOT found in deployed assets.\"
        echo \"   Listing assets:\"
        ls -la \"\$FOUND_PATH/assets\"
    fi
"
