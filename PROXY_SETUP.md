# Setup Nginx proxy with Lets Encrypt with Docker

Create a directory to conatin required files.
```sh
$ mkdir nginx-proxy && cd nginx-proxy
```

Once that's finished, issue the following command to create a unique network for `nginx-proxy` and other Docker containers to communicate through.
```sh
$ docker network create nginx-proxy
```

In the `nginx-proxy` directory, create a new file named `docker-compose.yml` and paste in the following text:
```yaml
version: '3'
services:
  nginx:
    image: nginx
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - conf:/etc/nginx/conf.d
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - certs:/etc/nginx/certs
    labels:
      - "com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy=true"

  dockergen:
    image: nginxproxy/docker-gen
    container_name: nginx-proxy-gen
    depends_on:
      - nginx
    command: -notify-sighup nginx-proxy -watch -wait 5s:30s /etc/docker-gen/templates/nginx.tmpl /etc/nginx/conf.d/default.conf
    volumes:
      - conf:/etc/nginx/conf.d
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - certs:/etc/nginx/certs
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./nginx.tmpl:/etc/docker-gen/templates/nginx.tmpl:ro

  letsencrypt:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-le
    depends_on:
      - nginx
      - dockergen
    environment:
      NGINX_PROXY_CONTAINER: nginx-proxy
      NGINX_DOCKER_GEN_CONTAINER: nginx-proxy-gen
    volumes:
      - conf:/etc/nginx/conf.d
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - certs:/etc/nginx/certs
      - /var/run/docker.sock:/var/run/docker.sock:ro

volumes:
  conf:
  vhost:
  html:
  certs:

# Do not forget to 'docker network create nginx-proxy' before launch, and to add '--network nginx-proxy' to proxied containers. 

networks:
  default:
    external:
      name: nginx-proxy
```

Inside of the `nginx-proxy` directory, use the following curl command to copy the developer's sample `nginx.tmpl` file to your VPS. 
```sh
curl https://raw.githubusercontent.com/nginx-proxy/nginx-proxy/master/nginx.tmpl > nginx.tmpl
```

Lastly, start everything with `docker-compose`.
```sh
$ docker-compose up -d
```
