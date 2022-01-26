# CLA Frontend

Frontend application for the Civil Legal Aid Tool.

## Dependencies

- [Virtualenv](http://www.virtualenv.org/en/latest/)
- [docker](https://www.docker.com/)
- [Python 2.7](http://www.python.org/) (Can be installed using `brew`)
- [nodejs.org](http://nodejs.org/) (v8.9.3 - can be installed using [nvm](https://github.com/creationix/nvm))
- [Sass](http://sass-lang.com/)
- [gulp.js](http://gulpjs.com/) (Installed using `npm install` and npm scripts tasks)
- [Bower](http://bower.io/) (Installed using `npm install` and npm scripts tasks)

Note that you only need to install the gulp command line utility as the local version will be installed later on as part of the application.

## Installation

Clone the repository:

```
git clone git@github.com:ministryofjustice/cla_frontend.git
```
or
```
git clone https://github.com/ministryofjustice/cla_frontend.git
```


Next, create the environment and start it up:

```
cd cla_frontend
virtualenv -p python2.7 env --prompt=\(cla_fe\)
```
and on Linux and Mac
```
source env/bin/activate
```
and on Windows
```
env\scripts\activate
```

Update pip to the latest version:
```
pip install -U pip
```

Install dev Python dependencies:
```
pip install -r requirements/dev.txt
```

Create a `local.py` settings file from the example file:

on Linux and Mac
```
cp cla_frontend/settings/.example.local.py cla_frontend/settings/local.py
```
on Windows
```
copy cla_frontend\settings\.example.local.py cla_frontend\settings\local.py
```

Install node packages:
Currently due to using an older node for installing modules we have a script that sets and unsets some git settings around the npm install command.  This will no longer be needed when we update our node and module versions.
```
./npm_git_wrapper.sh
```
Do not, for now, use the plain npm install command.
```
npm install
```

Install bower packages:
```
npm run bower
```

Compile assets:
```
npm run build
```

Install the socket server node packages. Open a new terminal and run:

```
cd cla_frontend/cla_socketserver/
```
then
```
npm install
node app.js
```
Leave this running and return to the previous window/tabtab, start the runserver. Don't forget to keep the backend server running on port 8000:

```
python ./manage.py runserver 8001
```

#### Dev
```
docker-compose -f docker-compose-local.yml up
```

Setups the [CLA Backend](https://github.com/ministryofjustice/cla_backend) for the service to consume.

Each time you start a new terminal instance you will need to run the
following commands to get the server running again:
```
source env/bin/activate

./manage.py runserver 8001
```

We suggest you should keep 3 terminals (+1 for the backend):

1. with django runserver running
```
source env/bin/activate
./manage.py runserver 8001
```
2. with the socket server running
```
cd cla_frontend/cla_socketserver/
npm install
node app.js
```
3. with gulp watching and compiling the assets
```
gulp build && gulp watch
```

If using the Django Toolbar, include the following in your `local.py`:
```
if DEBUG:
   CSP_DEFAULT_SRC = ("self", "unsafe-inline", "unsafe-eval", 'ajax.googleapis.com', 'data:', 'localhost:8005')
```

### Frontend
Assets are managed using [gulp.js](http://gulpjs.com/). To compile
the assets once, after a pull for example, run:
```
npm run build
```

Any problems with npm which could be resolved by installing all the
modules again? Try deleting the `node_modules` directory and running
`npm install` again.

## Unit Testing
```
npm test
```

## End to end browser tests

The browser tests reside in https://github.com/ministryofjustice/laa-cla-e2e-tests. Follow the instructions to get these running on your local machine.

If you want to run the tests whilst developing, you'll need to update `docker-compose.yml` from:

```
cla_frontend:
   image: [url_to_remote_image]
```
to something like:
```
cla_frontend:
   build:
      context: ../cla_frontend
```
where the context directory is set to the root of the cla_public directory.

## Development

When making frequent changes to the assets you can run a gulp watch
command to instantly compile any assets. To watch the source assets,
leave the following command running in a terminal:

```
npm run watch
```

The `watch` task allows you to use [livereload](http://livereload.com/) with this project. The easiest
way to utilise livereload is to:

- Install the [chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)
- Allow websocket connections locally on CSP (Content Security Policy) by adding `'ws://'` to `CSP_DEFAULT_SRC` in `local.py`. Full
   example:

```
if DEBUG: 
   CSP_DEFAULT_SRC = ("self", "unsafe-inline", "unsafe-eval", 'ajax.googleapis.com', 'data:', 'cdn.ravenjs.com', 'app.getsentry.com', 'ws://')
```
- Run `npm run watch`
- Enable livereload by clicking the icon in Chrome

Now any changes in the assets folder will automatically reload the site in Chrome.

## Lint and pre-commit hooks

To lint with Black and flake8, install pre-commit hooks:
```
. env/bin/activate
pip install -r requirements/dev.txt
pre-commit install
```

To run them manually:
```
pre-commit run --all-files
```


## To Build Individual Parts

### Stylesheets
Stylesheets are located in `cla_frontend/assets-src/stylesheets` and are compiled into 
`cla_frontend/assets/stylesheets`. They are written in Sass using the `scss` syntax.

To compile the stylesheets run:
```
npm run sass
```

### Javascripts
Javascripts files are located in `cla_frontend/assets/src/javascripts`
and are concatinated into `cla_frontend/assets/javascripts`. To
compile the javascript files run:

```
npm run js
```

### Images
Image are optimised and copied into the `cla_frontend/assets/images`
folder using gulp. Source images should be stored in
`cla_frontend/assets-src/images`. To optimise and copy images into assets run:
```
npm run images
```

## Troubleshooting
If the application does not run because SECRET_KEY is not defined, then add SECRET_KEY as an environment variable.

If the application runs but you get a 400 error (Bad request) when using 127.0.0.1:8001 then you will need to update the ALLOWED_HOSTS environment variable.

If the application runs locally but there are no images then this means that DEBUG is set to False. Add the following line to local.py to change it to True.

```
DEBUG = True
```

If you wish to view the Disregards questions in the eligibility templates then set the following flag in local.py

```
SHOW_DISREGARDS_FEATURE_FLAG = True
```

Without Google Analytics set up, the application will fail silently when a user clicks on the Assign button.

As a temporary fix, devs should create environment variables GA_ID (any value) and GA_DOMAIN (localhost). Long term another ticket to be created to update js code so that if no Google Analytics available then an error is raised but the application will still run.

## To demo the service
```
docker-compose up
```

This should start up the backend and frontend with compiled assets. All you need to
do is go to http://localhost:8001.

Known Issues:
`clabackend` and `db` containers might not be ready first time round so you might have
to stop the docker-compose up and then run it again.

## Releasing

### Releasing to non-production

Please make sure you tested on a non-production environment before merging.

This process now runs entirely through CircleCI. There are manual approvals required but the process can be run at any time of the day and through working hours.

1. Wait for [the Docker build to complete on CircleCI](https://circleci.com/gh/ministryofjustice/cla_frontend) for the feature branch associated with the pull request. 
1. If the branch passes CircleCI then ask for the pull request to be approved then merge the pull request into the main github branch.
1. Once the merge is complete then go to CircleCI to check jobs are progressing on the main branch. Note that there is a job called static_uat_deploy_approval - this does not need to be approved unless your change requires this.
1. CircleCI will stop and wait for manual approval at 'staging_deploy_approval'. Proceed with approval (click on the thumb icon) if all  prior jobs have successfully completed.
1. Once the staging jobs have finished then check that the staging server is running correctly. The url will be in the slack message associated with the most recent job in cla-notifications.
1. if staging is not working then any changes should be rolled back and the feature checked. If staging is working correctly then manually approve production_deploy_approval.
1. Everything should pass and complete. If you haven't approved static_uat_deploy_approval then the pipeline will show on hold - this is ok.