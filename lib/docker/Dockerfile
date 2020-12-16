FROM node:lts-alpine

WORKDIR /usr/app
ENV CI true

ENV PORT {{port}}

EXPOSE {{port}}

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .
RUN rm -r /usr/app/solution
COPY solution .

CMD [ "npm", "start" ]
