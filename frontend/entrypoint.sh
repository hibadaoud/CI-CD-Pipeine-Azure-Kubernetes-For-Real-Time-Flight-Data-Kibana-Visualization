#!/bin/sh
set -e

# Substitute environment variables in JS files at container startup
for f in /usr/share/nginx/html/*.js; do
  envsubst < "$f" > "${f}.tmp" && mv "${f}.tmp" "$f"
done

exec nginx -g 'daemon off;'
