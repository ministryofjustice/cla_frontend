#!/bin/bash

docker kill node-firefox
docker kill node-chrome
docker kill selenium-hub
docker rm node-firefox
docker rm node-chrome
docker rm selenium-hub
docker run -d -p 4444:4444 -P --name selenium-hub selenium/hub:$1
docker run -d --name node-chrome --link selenium-hub:hub selenium/node-chrome:$1
docker run -d --name node-firefox --link selenium-hub:hub selenium/node-firefox:$1
