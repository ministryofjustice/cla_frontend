#
# CLA_FRONTEND Dockerfile
#
# Pull base image.
FROM phusion/baseimage:0.9.11

MAINTAINER Peter Idah <peter.idah@digital.justice.gov.uk>

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Set timezone
RUN echo "Europe/London" > /etc/timezone  &&  dpkg-reconfigure -f noninteractive tzdata

# Remove SSHD
RUN rm -rf /etc/service/sshd /etc/my_init.d/00_regen_ssh_host_keys.sh

# Dependencies
RUN DEBIAN_FRONTEND='noninteractive' apt-get update && \
  apt-get -y --force-yes install bash apt-utils python-pip \
  python-dev build-essential git software-properties-common \
  python-software-properties libpq-dev libpcre3 libpcre3-dev \
  nodejs npm

# Install Nginx.
RUN DEBIAN_FRONTEND='noninteractive' add-apt-repository ppa:nginx/stable && apt-get update
RUN DEBIAN_FRONTEND='noninteractive' apt-get -y --force-yes install nginx-full && \
  chown -R www-data:www-data /var/lib/nginx

ADD ./docker/htpassword /etc/nginx/conf.d/htpassword
RUN rm -f /etc/nginx/sites-enabled/default && chown www-data:www-data /etc/nginx/conf.d/htpassword

#Pip install Python packages

RUN pip install GitPython uwsgi

RUN mkdir -p /var/log/wsgi /var/log/nodejs && chown -R www-data:www-data /var/log/wsgi /var/log/nodejs && chmod -R g+s /var/log/wsgi /var/log/nodejs

RUN  mkdir -p /var/log/nginx/cla_frontend
ADD ./docker/cla_frontend.ini /etc/wsgi/conf.d/cla_frontend.ini

# install service files for runit
ADD ./docker/nginx.service /etc/service/nginx/run

# install service files for runit
ADD ./docker/uwsgi.service /etc/service/uwsgi/run

# install service files for runit
ADD ./docker/nodejs.service /etc/service/nodejs/run

# Define mountable directories.
VOLUME ["/data", "/var/log/nginx", "/var/log/wsgi"]

# Expose ports.
EXPOSE 80

EXPOSE 443

# APP_HOME
ENV APP_HOME /home/app/django

# Add project directory to docker
ADD ./ /home/app/django

# Define working directory.
#WORKDIR /home/app/django

RUN cd /home/app/django && cat docker/version >> /etc/profile

# PIP INSTALL APPLICATION
RUN cd /home/app/django && pip install -r requirements/production.txt && find . -name '*.pyc' -delete

# Collect static
RUN cd /home/app/django && python manage.py collectstatic --noinput --settings=cla_frontend.settings.production

# Install socket.io application
RUN cd /home/app/django/cla_socketserver && npm install

# ln settings.docker -> settings.local
RUN ln -s /home/app/django/cla_frontend/settings/docker.py /home/app/django/cla_frontend/settings/local.py

ADD ./docker/nginx.conf /etc/nginx/nginx.conf
ADD ./docker/server.key /etc/ssl/private/server.key
ADD ./docker/server.crt /etc/ssl/certs/server.crt
