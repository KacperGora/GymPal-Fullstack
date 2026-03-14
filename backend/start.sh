#!/bin/sh
echo "=== START SCRIPT RUNNING ==="
echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"
echo "Starting server..."
node --max-old-space-size=768 dist/main
