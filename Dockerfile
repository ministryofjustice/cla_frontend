#
# CLA_PUBLIC Dockerfile all environments
#
# Pull base image.
FROM phusion/baseimage:0.9.16

MAINTAINER Stuart Munro <stuart.munro@digital.justice.gov.uk>

# Runtime User
RUN useradd -m -d /home/app app

# Set timezone
RUN echo "Europe/London" > /etc/timezone  &&  dpkg-reconfigure -f noninteractive tzdata

# Dependencies
RUN DEBIAN_FRONTEND='noninteractive' \
  apt-get update && \
  apt-get -y --force-yes install bash apt-utils build-essential git software-properties-common libpq-dev \
  g++ make libpcre3 libpcre3-dev libxslt-dev libxml2-dev wget libffi-dev nodejs npm

RUN apt-get clean

# Install latest python
ADD ./docker/install_python.sh /install_python.sh
RUN chmod 755 /install_python.sh
RUN /install_python.sh

# Add requirements to docker
ADD ./requirements/base.txt /requirements.txt
RUN pip install -r /requirements.txt

# Install SocketIO dependancies
ADD ./cla_socketserver /socketio
RUN cd /socketio && npm install
RUN  chmod 755 /socketio/run.sh
RUN  chown -R app: /socketio

# Add project directory to docker
ADD . /home/app/django
RUN  chown -R app: /home/app/django

ADD ./docker/run.sh /run.sh
RUN  chmod 755 /run.sh

# Set correct environment variables.
ENV HOME /home/app/django
WORKDIR /home/app/django
ENV APP_HOME /home/app/django
USER app
ENTRYPOINT /run.sh
EXPOSE 8000
