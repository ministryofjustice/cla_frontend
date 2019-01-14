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

## Installation

Clone the repository:

```
git clone git@github.com:ministryofjustice/cla_frontend.git
```

Next, create the environment and start it up:

```
cd cla_frontend
virtualenv env --prompt=\(cla_fe\)

source env/bin/activate
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
```
cp cla_frontend/settings/.example.local.py cla_frontend/settings/local.py
```

Install node packages:
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

Install the socket server node packages. Open a new terminal, `cd` to `cla_frontend` and run:
```
cd cla_frontend/cla_socketserver/
npm install
node app.js
```

In the main tab, start the runserver. Don't forget to keep the backend server running on port 8000:
```
./manage.py runserver 8001
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

1. Wait for [the Docker build to complete on CircleCI](https://circleci.com/gh/ministryofjustice/cla_frontend) for the feature branch.
1. Copy the `feature_branch.<sha>` reference from the `build` job's "Push Docker image" step. Eg:
    ```
    Pushing tag for rev [9a77ce2f0e8a] on {https://registry.service.dsd.io/v1/repositories/cla_frontend/tags/dual-docker-registries.902c45d}
    ```
1. [Deploy `feature_branch.<sha>`](https://ci.service.dsd.io/job/DEPLOY-cla_frontend/build?delay=0sec).
    * `tag` is the branch that needs to be released plus a specific 7-character prefix of the Git SHA. (`dual-docker-registries.902c45d` for the above example).
    * `environment` is the target environment, select depending on your needs, eg. "demo", "staging", etc.
    * `branch` is the [deploy repo's](https://github.com/ministryofjustice/cla_frontend-deploy) default branch name, usually master.

### Releasing to production

>#### :warning: Release to production outside of business hours
> __Business hours__: 09:00 to 20:00  
>__Why?__ Any downtime on the frontend and backend between 09:00 and 20:00 can have serious consequences, leading to shut down of the court legal advice centres, possible press reports and maybe MP questions.  
>__Is there downtime when a release occurs?__ Usually it's just a few seconds. However changes that involve Elastic IPs can take a bit longer.

1. Please make sure you tested on a non-production environment before merging.
1. Merge your feature branch pull request to `master`.
1. Wait for [the Docker build to complete on CircleCI](https://circleci.com/gh/ministryofjustice/cla_frontend/tree/master) for the `master` branch.
1. Copy the `master.<sha>` reference from the `build` job's "Push Docker image" step. Eg:
    ```
    Pushing tag for rev [d96e0157bdac] on {https://registry.service.dsd.io/v1/repositories/cla_frontend/tags/master.b24490d}
    ```
1. [Deploy `master.<sha>` to **prod**uction](https://ci.service.dsd.io/job/DEPLOY-cla_frontend/build?delay=0sec).

:tada: :shipit:
