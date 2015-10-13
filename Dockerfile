FROM node:4.1

ENV NODE_ENV=production

# This dockerfile is designed to run from the jenkins build server, i.e. please
# run 'npm install' and 'gulp' to prepare all dependencies and build the project.
# The built/compiled/installed dependencies with be copied into the docker image 
# using the COPY command instead.
WORKDIR /www
COPY . .

EXPOSE 5280

RUN npm rebuild

CMD ["node", "bin/www"]