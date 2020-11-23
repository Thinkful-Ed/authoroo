FROM node:lts-alpine

WORKDIR /usr/app

EXPOSE 5000

COPY package*.json ./

RUN npm ci

COPY . .
RUN rm -r /usr/app/solution
COPY solution .

RUN npm run build

CMD [ "node", "/usr/app/src/server.js" ]
