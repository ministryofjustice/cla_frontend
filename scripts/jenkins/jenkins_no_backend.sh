#/bin/bash

set -e

# Setup Python virtualenv and install Python modules, then some clean up
/usr/local/bin/virtualenv $WORKSPACE/.env
$WORKSPACE/.env/bin/pip install -r requirements/jenkins.txt
rm -rf cla_frontend/assets-src/vendor

# Install dependencies
$WORKSPACE/.env/bin/python manage.py builddata constants_json
bundle install
npm prune
bower prune

npm install
bower install
gulp build

# Run tests that don;t rely on CLA_BACKEND being available
$WORKSPACE/.env/bin/python manage.py jenkins --coverage-rcfile=.coveragerc --settings=cla_frontend.settings.jenkins
npm run test-single-run

