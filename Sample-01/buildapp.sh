#!/bin/bash
npm run build

sudo cp -p ~/auth0-react-samples/Sample-01/build/* /usr/share/nginx/html/
sudo cp -p -r ~/auth0-react-samples/Sample-01/build/static /usr/share/nginx/html/

# 権限変更
sudo chown -R root:root /usr/share/nginx/html

# Nginx再起動
sudo systemctl restart nginx
