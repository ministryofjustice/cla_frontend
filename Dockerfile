#################################################
# BASE IMAGE USED BY ALL STAGES
#################################################
FROM alpine:3.11 as base

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

# Install node dependencies
COPY package.json package-lock.json ./
RUN git config --global url."https://github.com/".insteadOf git@github.com:
RUN git config --global url."https://".insteadOf git://
RUN npm install --no-optional
RUN git config --global --unset url."https://github.com/".insteadOf git@github.com:
RUN git config --global --unset url."https://".insteadOf git://

# Install front-end dependencies
COPY .bowerrc bower.json ./
RUN npm run bower

# Build front-end assets
COPY tasks/ ./tasks
COPY cla_frontend/assets-src ./cla_frontend/assets-src/
COPY gulpfile.js ./
RUN npm run build

COPY ./requirements ./requirements

#################################################
# DEVELOPMENT
#################################################

FROM base AS development

RUN pip install -r ./requirements/dev.txt --no-cache-dir
COPY . .

# Make sure static assets directory has correct permissions
RUN chown -R app:app /home/app && \
    mkdir -p cla_backend/assets

USER 1000
EXPOSE 8000
CMD ["docker/run_dev.sh"]

#################################################
# TEST
#################################################
# FROM development AS test
#
# ARG specific_test_input=""
# ENV specific_test $specific_test_input
#
# USER 1000
# CMD ["sh", "-c", "./manage.py test $specific_test"]


#################################################
# PRODUCTION
#################################################
FROM base AS production

RUN pip install -r ./requirements/production.txt

COPY . .

# Make sure static assets directory has correct permissions
RUN chown -R app:app /home/app && \
    mkdir -p cla_frontend/assets

# Add file for liveness probe
RUN touch /tmp/listen_queue_healthy && \
    chown app:app /tmp/listen_queue_healthy

USER 1000
EXPOSE 8000

CMD ["docker/run.sh"]
