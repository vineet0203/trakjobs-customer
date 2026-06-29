#!/bin/bash
echo "🚀 Deploying..."
cd /var/www/Trakjobs-customer
git fetch origin main
git reset --hard origin/main
npm install
npm run build
echo "✅ Done!"
