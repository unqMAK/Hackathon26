#!/bin/bash
HOST="72.62.64.170"
USER="root"

echo "=== 🔍 Check Announcements in Database ==="

ssh $USER@$HOST "
    cd /var/www/hacksphere/server
    node -e \"
        const mongoose = require('mongoose');
        require('dotenv').config();
        
        mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hacksphere')
        .then(async () => {
            const announcements = await mongoose.connection.db.collection('announcements').find({}).toArray();
            console.log('\\n=== All Announcements ===');
            announcements.forEach((a, i) => {
                console.log('\\n%d. %s', i+1, a.title);
                console.log('   Type: %s, Audience: %s', a.type || 'null', a.audience || 'null');
                console.log('   DisplayLocation: \\\"%s\\\"', a.displayLocation);
                console.log('   Created: %s', a.createdAt);
            });
            process.exit(0);
        })
        .catch(err => { console.error(err); process.exit(1); });
    \"
"
