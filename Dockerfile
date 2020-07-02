FROM node:12-alpine

WORKDIR /opt/pingd

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npm prune --production

RUN apk update && apk add --no-cache mtr iputils

CMD [ "sh", "-c", "source .env && node dist/index.js" ]