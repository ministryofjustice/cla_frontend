#
# CLA_FRONTEND Dockerfile
#
# Pull base image.
FROM phusion/baseimage:0.9.22

MAINTAINER Platforms <platforms@digital.justice.gov.uk>

# Set correct environment variables.
ENV HOME /root
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

# Add default build variables
ENV APP_VERSION ""
ENV APP_GIT_COMMIT ""
ENV APP_BUILD_DATE ""
ENV APP_BUILD_TAG ""

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Set timezone
ENV TZ "Europe/London"
RUN echo $TZ > /etc/timezone && \
    apt-get update && apt-get install -y tzdata && \
    rm /etc/localtime && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean


# Remove SSHD
RUN rm -rf /etc/service/sshd /etc/my_init.d/00_regen_ssh_host_keys.sh

# Dependencies
RUN DEBIAN_FRONTEND='noninteractive' && \
  apt-get -y --force-yes install bash apt-utils python-pip \
  python-dev build-essential git software-properties-common \
  python-software-properties libpq-dev libpcre3 libpcre3-dev \
  nodejs npm ruby-bundler nginx-full

RUN npm install -g n   # Install n globally
RUN n 4.8.4          # Install and use latest v0.4.X

# Configure Nginx.
ADD ./docker/htpassword /etc/nginx/conf.d/htpassword
RUN chown -R www-data:www-data /var/lib/nginx && \
  rm -f /etc/nginx/sites-enabled/default && \
  chown www-data:www-data /etc/nginx/conf.d/htpassword

# Pip install Python packages
RUN pip install -U setuptools pip wheel
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

# Hosts file hack for smoketest
ADD ./docker/hosts /tmp/hosts

# Define mountable directories.
VOLUME ["/data", "/var/log/nginx", "/var/log/wsgi"]

# Expose ports.
EXPOSE 80

EXPOSE 443

EXPOSE 8005

# APP_HOME
ENV APP_HOME /home/app/django

# Add project directory to docker
ADD ./ /home/app/django

# Define working directory.
#WORKDIR /home/app/django

RUN cd /home/app/django && cat docker/version >> /etc/profile

# PIP INSTALL APPLICATION
RUN cd /home/app/django && pip install -r requirements/production.txt && find . -name '*.pyc' -delete

# clear any npm cache
RUN cd /home/app/django && npm cache clear && rm -rf /root/.npm

# Compile assets
RUN cd /home/app/django && python manage.py builddata constants_json

RUN cd /home/app/django && bundle install

RUN cd /home/app/django && npm prune && npm install -g bower gulp

RUN cd /home/app/django && bower --allow-root  prune

RUN cd /home/app/django && npm install

RUN cd /home/app/django && bower --allow-root install

#RUN cd /home/app/django && npm update

RUN cd /home/app/django && gulp build


# Collect static
RUN cd /home/app/django && python manage.py collectstatic --noinput --settings=cla_frontend.settings.production

# Install socket.io application
RUN cd /home/app/django/cla_socketserver && npm install

# ln settings.docker -> settings.local
RUN ln -s /home/app/django/cla_frontend/settings/docker.py /home/app/django/cla_frontend/settings/local.py

ADD ./docker/nginx.conf /etc/nginx/nginx.conf

# Cleanup
RUN apt-get remove -y npm ruby-bundler && apt-get autoremove -y
