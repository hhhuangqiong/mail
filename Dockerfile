FROM node:4

ENV NODE_ENV=production

# disable cache for babel register, avoid permission problem for babel-register with user no body
ENV BABEL_DISABLE_CACHE=1

# This dockerfile is designed to run from the jenkins build server, i.e. please
# run 'npm install' and 'gulp' to prepare all dependencies and build the project.
# The built/compiled/installed dependencies with be copied into the docker image
# using the COPY command instead.
WORKDIR /www
COPY . .

# 1. application listening port
# 2. debug port
EXPOSE 3000 5858

RUN npm rebuild

USER nobody

CMD ["node", "bin/www"]
