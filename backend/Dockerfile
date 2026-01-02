FROM node:20-alpine

RUN apk add --no-cache tzdata

ENV TZ="Asia/Bangkok"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package*.json ./
COPY .npmrc .npmrc
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]
