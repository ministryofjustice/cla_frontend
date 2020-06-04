#
# CLA_FRONTEND Dockerfile
#
# Pull base image.
FROM phusion/baseimage:0.9.22

# Set environment variables.
ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Install updates and dependencies
RUN apt-get update -qq && apt-get install -y --force-yes -qq \
    bash apt-utils \
    build-essential \
    git \
    libpq-dev \
    libpcre3 \
    libpcre3-dev \
    nginx-full \
    nodejs \
    npm \
    python-dev \
    python-pip \
    python-software-properties \
    software-properties-common \
    tzdata \
    && apt-get clean

# Set timezone
RUN ln -fs /usr/share/zoneinfo/Europe/London /etc/localtime

# Install n globally and use v8.9.3
RUN npm install -g n && n 8.9.3

# Remove SSHD
RUN rm -rf /etc/service/sshd /etc/my_init.d/00_regen_ssh_host_keys.sh

# Configure Nginx
ADD ./docker/htpassword /etc/nginx/conf.d/htpassword
RUN chown -R www-data:www-data /var/lib/nginx && \
    rm -f /etc/nginx/sites-enabled/default && \
    chown www-data:www-data /etc/nginx/conf.d/htpassword

# Pip install Python packages
RUN pip install -U pip
RUN pip install -U setuptools wheel
RUN pip install GitPython uwsgi

RUN mkdir -p /var/log/wsgi /var/log/nodejs && \
    chown -R www-data:www-data /var/log/wsgi /var/log/nodejs && \
    chmod -R g+s /var/log/wsgi /var/log/nodejs

RUN  mkdir -p /var/log/nginx/cla_frontend
ADD ./docker/cla_frontend.ini /etc/wsgi/conf.d/cla_frontend.ini

# install service files for runit
ADD ./docker/nginx.service /etc/service/nginx/run

# install service files for runit
ADD ./docker/uwsgi.service /etc/service/uwsgi/run

# install service files for runit
ADD ./docker/nodejs.service /etc/service/nodejs/run

# Hosts file hack for smoketest
ADD ./docker/hosts /tmp/hosts

# Define mountable directories.
VOLUME ["/data", "/var/log/nginx", "/var/log/wsgi"]

# Expose ports. (http, connection to DB, websocket port)
EXPOSE 80 443 8005

##############################################
# APPLICATION

# APP_HOME
ENV APP_HOME /home/app/django
WORKDIR /home/app/django

# Install python packages
COPY requirements/ ./requirements
COPY requirements.txt ./
RUN pip install -r requirements/production.txt && find . -name '*.pyc' -delete

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

# Copy application files
WORKDIR $APP_HOME
COPY manage.py              ./
COPY cla_frontend/apps      ./cla_frontend/apps/
COPY cla_frontend/settings  ./cla_frontend/settings/
COPY cla_frontend/templates ./cla_frontend/templates/
COPY cla_frontend/*.py      ./cla_frontend/
COPY docker/                ./docker/
COPY scripts/               ./scripts/
COPY tests/                 ./tests/

# Compile assets
RUN python manage.py builddata constants_json

# Collect static
RUN python manage.py collectstatic --noinput --settings=cla_frontend.settings.production

# ln settings.docker -> settings.local
RUN ln -s /home/app/django/cla_frontend/settings/docker.py /home/app/django/cla_frontend/settings/local.py

COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# Not sure what this is for
RUN cat docker/version >> /etc/profile

# Cleanup
RUN apt-get remove -y npm && apt-get autoremove -y
