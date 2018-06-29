# ---------------------------------------------
# Build frontend dependencies and socket.io app
# ---------------------------------------------
FROM node:8.11.3 AS frontend

WORKDIR /app

RUN npm i npm@latest -g

# Install node dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install front-end dependencies
COPY .bowerrc bower.json ./
RUN npm run bower 

# Build front-end assets
COPY tasks/ ./tasks
COPY cla_frontend/assets-src ./cla_frontend/assets-src/
COPY gulpfile.js ./
RUN npm run build

# Install socket.io application
COPY cla_socketserver ./cla_socketserver/
WORKDIR cla_socketserver
RUN npm install

# --------------------------------------
# Base python
# --------------------------------------
FROM python:2.7 AS base
# Create app directory
WORKDIR /home/app/django

# --------------------------------------
# Dependencies
# --------------------------------------
FROM base AS dependencies  
RUN pip install -U setuptools pip wheel
RUN pip install GitPython uwsgi
COPY requirements/ ./requirements
COPY requirements.txt ./
RUN pip install -r requirements/production.txt

# --------------------------------------
# Copy Files/Build 
# --------------------------------------
FROM dependencies AS build  
WORKDIR /home/app/django
COPY . .
COPY --from=frontend /app/cla_frontend/assets ./cla_frontend/assets
# Build / Compile if required
RUN python manage.py builddata constants_json

# Collect static
RUN python manage.py collectstatic --noinput --settings=cla_frontend.settings.production

# --------------------------------------
# Release with baseimage
# --------------------------------------
FROM phusion/baseimage:0.9.22 AS release
ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Install updates and dependencies
RUN apt-get -q update && apt-get -qy install \
    git \
    nginx-full \
    nodejs \
    python-pip \
    tzdata \
    && apt-get -qy autoremove \
    && apt-get clean \
    && rm -r /var/lib/apt/lists/*

# Set timezone
RUN echo $TZ > /etc/timezone \
    && rm /etc/localtime \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

# Remove SSHD
RUN rm -rf /etc/service/sshd /etc/my_init.d/00_regen_ssh_host_keys.sh

# Configure Nginx
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/htpassword /etc/nginx/conf.d/htpassword

RUN chown -R www-data:www-data /var/lib/nginx && \
    rm -f /etc/nginx/sites-enabled/default && \
    chown www-data:www-data /etc/nginx/conf.d/htpassword

RUN mkdir -p /var/log/wsgi /var/log/nodejs && \
    chown -R www-data:www-data /var/log/wsgi /var/log/nodejs && \
    chmod -R g+s /var/log/wsgi /var/log/nodejs

RUN  mkdir -p /var/log/nginx/cla_frontend
COPY ./docker/cla_frontend.ini /etc/wsgi/conf.d/cla_frontend.ini

# install service files for runit
COPY ./docker/nginx.service /etc/service/nginx/run

# install service files for runit
COPY ./docker/uwsgi.service /etc/service/uwsgi/run

# install service files for runit
COPY ./docker/nodejs.service /etc/service/nodejs/run

# Hosts file hack for smoketest
COPY ./docker/hosts /tmp/hosts

# Define mountable directories.
VOLUME ["/data", "/var/log/nginx", "/var/log/wsgi"]

# Expose ports. (http, connection to DB, websocket port)
EXPOSE 80 443 8005

# Create app directory
ENV APP_HOME /home/app/django
WORKDIR /home/app/django

RUN pip install -U pip
RUN pip install uwsgi 
COPY requirements/ ./requirements
COPY requirements.txt ./
COPY --from=dependencies /root/.cache /root/.cache
# Install app dependencies
RUN pip install -r requirements/production.txt

# Copy application files
COPY manage.py              ./
COPY cla_frontend/apps      ./cla_frontend/apps/
COPY cla_frontend/settings  ./cla_frontend/settings/
COPY cla_frontend/templates ./cla_frontend/templates/
COPY cla_frontend/*.py      ./cla_frontend/
COPY docker/                ./docker/
COPY scripts/               ./scripts/

# # Copy front-end assets
COPY --from=build /home/app/django/cla_frontend/static ./cla_frontend/static

# # Install socket.io application
COPY cla_socketserver ./cla_socketserver/

# ln settings.docker -> settings.local
RUN ln -s /home/app/django/cla_frontend/settings/docker.py /home/app/django/cla_frontend/settings/local.py

# Not sure what this is for
RUN cat docker/version >> /etc/profile

# --------------------------------------
# Test the release
# --------------------------------------
FROM build AS test-python
ENV BACKEND_BASE_URI localhost
WORKDIR /home/app/django
COPY --from=release /home/app/django ./
RUN mkdir -p /var/log/wsgi && touch debug.log
RUN pip install -r requirements/jenkins.txt
RUN python manage.py test

# --------------------------------------
# Test the front-end unit tests
# --------------------------------------
FROM frontend AS test-frontend
WORKDIR /app
COPY tests/ ./tests/
RUN npm run test-single-run

FROM release