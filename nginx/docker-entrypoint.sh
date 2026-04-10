#!/bin/sh
set -eu

mkdir -p /etc/nginx/certs

if [ ! -f /etc/nginx/certs/dev.crt ] || [ ! -f /etc/nginx/certs/dev.key ]; then
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/certs/dev.key \
    -out /etc/nginx/certs/dev.crt \
    -subj "/C=FR/ST=IDF/L=Paris/O=NexusEats/OU=Dev/CN=localhost"
fi

nginx -g 'daemon off;'
