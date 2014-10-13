#!/bin/bash

port=$((((RANDOM + RANDOM) % 63001) + 2000))
ssh -A -o 'ServerAliveInterval 30' -i ../../config/default.pem -N -p 22 -L4444:localhost:4444 -R$port:localhost:$port ubuntu@ec2-54-77-178-131.eu-west-1.compute.amazonaws.com &
sleep 5
java -jar ../node_modules/protractor/selenium/selenium-server-standalone-*.jar -role node -hub http://localhost:4444/grid/register -host localhost -port $port -nodeConfig ./performance_node_config.json

kill %1
