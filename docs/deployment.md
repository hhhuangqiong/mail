# Deployment

## Docker

M800 Mail Service is provided as a docker image, that can be simply run as a daemon.


### Pull and run a docker image

- $image_name: Docker image name (e.g., docker.dev.maaii.com/m800/mail-service:latest)

```
docker pull $image_name
docker run --env-file=envfile --name mail -d -p 4011:3000 $image_name
```

### Configurations (Env variables)

Configuration to the container can be specified through Enviornment variables. The list of available configurations

| Field | Descriptions | e.g. |
| ---   | --- | --- |
| TZ | Server Timezone | Asia/Hong_Kong |
| mongodb__uri | Mongo DB URI (without | mongodb://192.168.119.71/m800-mail-service | 
| mongodb\_\_options__user | Mongo DB username | mailsvc-testbed-user |
| mongodb\_\_options__pass | Mongo DB passowrd | oXWd4bZT |
| mongodb\_\_options\_\_server\_\_socketOptions__connectTimeoutMS | Mongo DB socket timeout (in ms) | 30000 |
