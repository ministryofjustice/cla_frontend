FROM alpine:3.11

RUN apk add --no-cache \
      bash \
      py2-pip \
      tzdata \
      gettext

RUN adduser -D app && \
    cp /usr/share/zoneinfo/Europe/London /etc/localtime

# To install pip dependencies
RUN apk add --no-cache \
      build-base \
      curl \
      git \
      libxml2-dev \
      libxslt-dev \
      linux-headers \
      python2-dev && \
    pip install -U setuptools pip==18.1 wheel GitPython \
    && apk add --repository=http://dl-cdn.alpinelinux.org/alpine/v3.7/main nodejs=8.9.3-r1

WORKDIR /home/app

# Install node and front-end dependencies
# NPM has now replaced bower for installing front-end dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build front-end assets
COPY tasks/ ./tasks
COPY cla_frontend/assets-src ./cla_frontend/assets-src/
COPY gulpfile.js ./
RUN npm run build

COPY ./requirements ./requirements
RUN pip install -r ./requirements/production.txt

COPY . .

# Make sure static assets directory has correct permissions
RUN chown -R app:app /home/app && \
    mkdir -p cla_frontend/assets

USER 1000
EXPOSE 8000

CMD ["docker/run.sh"]
