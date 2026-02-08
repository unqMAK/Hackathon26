#!/bin/bash
# Deploy to Production (Aggressive Update)

HOST="72.62.64.170"
USER="root"
SEARCH_APP_NAME="hacksphere-api"

echo "=== 🚀 Starting Deployment (Force Update) ==="
echo "Note: You will be prompted for the SSH password."

# 1. Discovery
echo ""
echo "🔍 Step 1: Finding running application..."
PM2_JSON=$(ssh $USER@$HOST "pm2 jlist")

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect."
    exit 1
fi

APP_DIR=$(echo "$PM2_JSON" | node -e "
    try {
        const list = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
        const app = list.find(p => p.name === '$SEARCH_APP_NAME' || p.name === 'PCM') || list[0];
        if (app) console.log(app.pm2_env.pm_cwd);
    } catch (e) { }
")

if [ -z "$APP_DIR" ]; then
    echo "⚠️  Could not detect app. Enter manually."
    read -p "Path (e.g., /var/www/hacksphere/server): " APP_DIR
fi

# Determine paths
# APP_DIR is .../server
SERVER_DIR="$APP_DIR"
PROJECT_ROOT=$(dirname "$SERVER_DIR")

echo "✅ Target: $PROJECT_ROOT"

# 2. Upload with cleanup
echo ""
echo "🗑️  Step 2: Cleaning old files..."
ssh $USER@$HOST "rm -rf $PROJECT_ROOT/dist $SERVER_DIR/dist && mkdir -p $PROJECT_ROOT/dist $SERVER_DIR/dist"

echo ""
echo "📤 Step 3: Uploading NEW compiled code..."
echo "   ... Uploading Frontend to $PROJECT_ROOT/dist ..."
scp -r dist/* $USER@$HOST:$PROJECT_ROOT/dist/

echo "   ... Uploading Backend to $SERVER_DIR/dist ..."
scp -r server/dist/* $USER@$HOST:$SERVER_DIR/dist/ || echo "❌ Backend upload failed"
scp server/package.json $USER@$HOST:$SERVER_DIR/

# 3. Restart
echo ""
echo "🔄 Step 4: Restarting..."
ssh $USER@$HOST "cd $SERVER_DIR && npm install --production && pm2 reload all"

echo ""
echo "=== ✅ Deployment Complete ==="
echo "Please verify by checking the site."
