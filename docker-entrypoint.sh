#!/bin/sh

# 替换环境变量
envsubst < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# 启动 nginx
nginx -g 'daemon off;' 