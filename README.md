# Transmi (torrent web interface)

A web interface to manage torrents. Can be used by multiple users. To each user his account, files and folder on the machine.

Uses [node-transmission](https://github.com/FLYBYME/node-transmission) and [svelte](https://svelte.technology/).

## Requirements/installation

- Docker
- nginx
- certbot

## Docker setup

```shell
# Build transmission
cd transmission
docker build -t transmission .

# Build transmi
cd ..
docker build -t transmi .

# A network to rule them all
docker network create transmi

# Transmission
docker volume create transmission-downloads
docker run -d \
  --name transmi-transmission \
  --network transmi \
  -v transmission-downloads:/transmission/downloads \
  transmission

# Nginx
docker run -d \
  --name transmi-nginx \
  -v transmission-downloads:/usr/share/nginx/html/download:ro \
  -p 7898:80 \
  nginx

# Transmi
docker volume create transmi-database
docker run -d \
  --name transmi-web \
  --network transmi \
  -v transmi-database:/opt/app/src/db \
  -p 7897:7897 \
  transmi

# Add a new user
docker run -it \
  --rm \
  --network transmi \
  -v transmi-database:/opt/app/src/db \
  transmi \
  npm run add-user
```

## nginx setup

Create a transmi.conf file in /etc/nginx/sites-available with this content :
```conf
server {
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name transmi.your-domain.ltd;

  location / {
    proxy_pass http://localhost:7897;
  }

  location /download {
    proxy_pass http://localhost:7898;
  }
}
```

Run certbot and select your transmi host
```shell
certbot --nginx
```

## Authors

- [Zajda Florent](https://github.com/zajdaf)
- [Maigret Aurélien](https://github.com/Dewep)

## Contributors

- [Colin Julien](https://github.com/Toldy)
