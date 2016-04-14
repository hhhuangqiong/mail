# Deployment

## Docker

Definitions:

- $image_name: Docker image name (e.g., docker.dev.maaii.com/m800/mail-service:latest)

```
docker pull $image_name
docker run --env-file=envfile --name mail -d -p 4011:3000 $image_name
```

Sample 'envfile':

```
TZ=Asia/Hong_Kong
mongodb__uri=mongodb://192.168.119.71/m800-mail-service
mongodb__options__user=mailsvc-testbed-user
mongodb__options__pass=oXWd4bZT
```
