#!/bin/bash
# Test Production APIs directly with the actual user's token

HOST="https://smc-mitvpuhackathon.in"

echo "=== 🔍 Testing Production APIs (Debug Mode) ==="

# Login and get token
echo "1. Logging in..."
LOGIN_RESP=$(curl -s -X POST "$HOST/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smc.gov.in","password":"Admin@123"}')

TOKEN=$(echo "$LOGIN_RESP" | node -e "
  const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
  console.log(data.token || '');
")

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed: $LOGIN_RESP"
    exit 1
fi
echo "✅ Login successful"

# Get a pending team ID
echo ""
echo "2. Getting pending team ID..."
PENDING_TEAMS=$(curl -s "$HOST/api/admin/pending-teams" \
  -H "Authorization: Bearer $TOKEN")
TEAM_ID=$(echo "$PENDING_TEAMS" | node -e "
  const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
  if (Array.isArray(data) && data.length > 0) console.log(data[0]._id);
")

if [ -z "$TEAM_ID" ]; then
    echo "❌ No pending teams found"
else
    echo "Team ID: $TEAM_ID"
    
    echo ""
    echo "3. Testing Team Details API..."
    TEAM_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$HOST/api/mentors/team/$TEAM_ID" \
      -H "Authorization: Bearer $TOKEN")
    echo "Response: $TEAM_RESP"
fi

# Test announcement creation
echo ""
echo ""
echo "4. Testing Announcement Creation API..."
ANNOUNCE_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$HOST/api/announcements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Debug Test",
    "message":"Testing announcement API directly",
    "type":"info",
    "audience":"all",
    "displayLocation":"both"
  }')
echo "Response: $ANNOUNCE_RESP"

echo ""
echo "=== Test Complete ==="
