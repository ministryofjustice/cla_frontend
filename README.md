# CLA

Frontend application for the Civil Legal Aid Tool.

## Dependencies

* [Virtualenv](http://www.virtualenv.org/en/latest/)
* [Python](http://www.python.org/) (Can be installed using `brew`)
* [Postgres](http://www.postgresql.org/)
* **Frontend:**
* [nodejs.org](http://nodejs.org/)
* [Sass](http://sass-lang.com/) (Ruby version - minimum v3.3)
* [gulp.js](http://gulpjs.com/) (Installed globally using `npm install -g gulp`)
* [Bower](http://bower.io/) (Installed globally using `npm install -g bower`)

## Installation

Clone the repository:

    git clone git@github.com:ministryofjustice/cla_frontend.git

Next, create the environment and start it up:

    virtualenv env --prompt=\(cla_fe\)

    source env/bin/activate

Install python dependencies:

    pip install -r requirements/local.txt

Install Frontend dependencies libraries:

    npm install -g bower gulp

Install bower packages:

    bower install

Install node packages:

    npm install

Compile assets:

    gulp build

Start the server:

    ./manage.py runserver 8001

## Dev

Each time you start a new terminal instance you will need to run the following commands to get the server running again:

    source env/bin/activate

    ./manage.py runserver 8001

## Frontend

Assets are managed using [gulp.js](http://gulpjs.com/). To compile the assets once, after a pull for example, run:

    gulp build

Any problems with npm which could be resolved by installing all the modules again?
Try deleting the 'node_modules' directory and running 'npm install' again.

### Testing

Unit tests-

    npm test

Selenium front end testing-

    npm run protractor


This will launch chrome in which the tests are run.


### Development

When making frequent changes to the assets you can run a gulp watch command to instantly compile any assets. To watch the source assets, leave the following command running in a terminal:

    gulp watch


## To Build Individual Parts

### Stylesheets

Stylesheets are located in `cla_frontend/assets-src/stylesheets` and are compiled into `cla_frontend/assets/stylesheets`. They are written in Sass using the `scss` syntax. To compile the stylesheets run:

    gulp sass

### Javascripts

Javascripts files are located in `cla_frontend/assets/src/javascripts` and are concatinated into `cla_frontend/assets/javascripts`. To compile the javascript files run:

    gulp js


### Images

Image are optimised and copied into the `cla_frontend/assets/images` folder using gulp. Source images should be stored in `cla_frontend/assets-src/images`. To optimise and copy images into assets run:

    gulp images


## Testing - methods to be obsoleted soon

CasperJS is used to run basic functional/browser tests on basic DOM interactions. To run the tests, make sure you have the following dependencies:

* [PhantomJS](http://phantomjs.org/)
* [CasperJS](http://casperjs.org/) (dev version)

To run the tests, use the following make command:

    make test

By default, tests will be run on `http://0.0.0.0:8001/`. To change this you can pass the `--url` argument on the command called in the make file. To see what command is called look at the `Makefile` at the project root.


