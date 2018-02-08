#
# CLA_FRONTEND Dockerfile
#
# Pull base image.
FROM phusion/baseimage:0.9.22

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Set timezone
RUN echo $TZ > /etc/timezone && \
    apt-get update && apt-get install -y tzdata && \
    rm /etc/localtime && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean

# Remove SSHD
RUN rm -rf /etc/service/sshd /etc/my_init.d/00_regen_ssh_host_keys.sh

# Dependencies
RUN DEBIAN_FRONTEND='noninteractive' apt-get update && \
  apt-get -y --force-yes install bash apt-utils python-pip \
  python-dev build-essential git software-properties-common \
  python-software-properties libpq-dev libpcre3 libpcre3-dev \
  nodejs npm ruby-bundler nginx-full

RUN npm install -g n   # Install n globally
RUN n 8.9.3            # Install and use v8.9.3

# Configure Nginx
ADD ./docker/htpassword /etc/nginx/conf.d/htpassword
RUN chown -R www-data:www-data /var/lib/nginx && \
    rm -f /etc/nginx/sites-enabled/default && \
    chown www-data:www-data /etc/nginx/conf.d/htpassword

# Pip install Python packages
RUN pip install -U setuptools pip wheel
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

# APP_HOME
ENV APP_HOME /home/app/django

# Add project directory to docker
ADD ./ /home/app/django

WORKDIR /home/app/django

RUN cat docker/version >> /etc/profile

# PIP INSTALL APPLICATION
RUN pip install -r requirements/production.txt && find . -name '*.pyc' -delete

# Compile assets
RUN python manage.py builddata constants_json

RUN bundle install

RUN npm install

RUN node_modules/.bin/bower --allow-root install

RUN node_modules/.bin/gulp build

# Collect static
RUN python manage.py collectstatic --noinput --settings=cla_frontend.settings.production

# Install socket.io application
RUN cd /home/app/django/cla_socketserver && npm install

# ln settings.docker -> settings.local
RUN ln -s /home/app/django/cla_frontend/settings/docker.py /home/app/django/cla_frontend/settings/local.py

ADD ./docker/nginx.conf /etc/nginx/nginx.conf

# Cleanup
RUN apt-get remove -y npm ruby-bundler && apt-get autoremove -y
