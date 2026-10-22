#!/bin/bash
cd /var/www/kipit-web/.output
export PORT=3002
export HOST=127.0.0.1
export NITRO_PORT=3002
export NITRO_HOST=127.0.0.1
exec node server/index.mjs
