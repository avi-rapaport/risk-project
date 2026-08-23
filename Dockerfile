FROM node:24-alpine

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

CMD [ "node", "--watch", "src/server.js" ]