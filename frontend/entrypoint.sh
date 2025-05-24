#!/bin/sh

# Generate config.js with env values
echo "window.BACKEND_API_BASE = \"${BACKEND_API_BASE}\";" > /usr/share/nginx/html/config.js

exec nginx -g 'daemon off;'
