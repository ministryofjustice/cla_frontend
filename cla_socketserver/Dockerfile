FROM node:18-alpine

RUN apk add --no-cache \
      curl \
      tzdata

RUN adduser -D app && \
    cp /usr/share/zoneinfo/Europe/London /etc/localtime

WORKDIR /home/app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

USER 1000
EXPOSE 8005

CMD ["node", "/home/app/server.js"]
