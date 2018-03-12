CLA Frontend
############

Frontend application for the Civil Legal Aid Tool.

Dependencies
------------

-  `Virtualenv <http://www.virtualenv.org/en/latest/>`__
-  `docker`<https://www.docker.com/>
-  `Python 2.7 <http://www.python.org/>`__ (Can be installed using ``brew``)
-  `nodejs.org <http://nodejs.org/>`__ (v8.9.3 - can be installed using nvm <https://github.com/creationix/nvm>)
-  `Sass <http://sass-lang.com/>`__ (Ruby version - minimum v3.4)
-  `gulp.js <http://gulpjs.com/>`__ (Installed globally using
   ``npm install -g gulp``)
-  `Bower <http://bower.io/>`__ (Installed globally using
   ``npm install -g bower``)

Installation
------------

Clone the repository:

::

    git clone git@github.com:ministryofjustice/cla_frontend.git

Next, create the environment and start it up:

::

    cd cla_frontend
    virtualenv env --prompt=\(cla_fe\)

    source env/bin/activate

Update pip to the latest version:

::

    pip install -U pip

Install python dependencies:

::

    pip install -r requirements/local.txt

Create a ``local.py`` settings file from the example file:

::

    cp cla_frontend/settings/.example.local.py cla_frontend/settings/local.py


Install node packages:

::

    npm install

Install bower packages:

::

    npm run bower

Compile assets:

::

    npm run build

Install the socket server node packages. Open a new terminal, cd to cla_frontend and run:

::

    cd cla_frontend/cla_socketserver/
    npm install
    node app.js

In the main tab, start the runserver. Don't forget to keep the backend server running on port 8000:

::

    ./manage.py runserver 8001

Dev
---

::
    docker-compose -f docker-compose-local.yml up

Setups the CLA Backend <https://github.com/ministryofjustice/cla_backend> for the service to consume.

Each time you start a new terminal instance you will need to run the
following commands to get the server running again:

::

    source env/bin/activate

    ./manage.py runserver 8001

We suggest you should keep 3 terminals (+1 for the backend):

1. with django runserver running

::

    source env/bin/activate

    ./manage.py runserver 8001

2. with the socket server running

::

    cd cla_frontend/cla_socketserver/
    npm install
    node app.js

3. with gulp watching and compiling the assets

::

    gulp build && gulp watch


If using the Django Toolbar, include the following in your ``local.py``:

::

    if DEBUG:
      CSP_DEFAULT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", 'ajax.googleapis.com', 'data:', 'localhost:8005')

Frontend
--------

Assets are managed using `gulp.js <http://gulpjs.com/>`__. To compile
the assets once, after a pull for example, run:

::

    npm run build

Any problems with npm which could be resolved by installing all the
modules again? Try deleting the 'node\_modules' directory and running
'npm install' again.

Testing
~~~~~~~

Unit tests-

::

    npm test

Selenium front end testing-

::

    npm run protractor

This will launch chrome in which the tests are run.

Development
~~~~~~~~~~~

When making frequent changes to the assets you can run a gulp watch
command to instantly compile any assets. To watch the source assets,
leave the following command running in a terminal:

::

    npm run watch

The ``watch`` task allows you to use
`livereload <http://livereload.com/>`__ with this project. The easiest
way to utilise livereload is to:

-  Install the `chrome
   extension <https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en>`__
-  Allow websocket connections locally on CSP (Content Security Policy)
   by adding ``'ws://'`` to ``CSP_DEFAULT_SRC`` in ``local.py``. Full
   example:

``if DEBUG:     CSP_DEFAULT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", 'ajax.googleapis.com', 'data:', 'cdn.ravenjs.com', 'app.getsentry.com', 'ws://')``

-  Run ``npm run watch``
-  Enable livereload by clicking the icon in Chrome

Now any changes in the assets folder will automatically reload the site
in Chrome.

To Build Individual Parts
-------------------------

Stylesheets
~~~~~~~~~~~

Stylesheets are located in ``cla_frontend/assets-src/stylesheets`` and
are compiled into ``cla_frontend/assets/stylesheets``. They are written
in Sass using the ``scss`` syntax. To compile the stylesheets run:

::

    npm run sass

Javascripts
~~~~~~~~~~~

Javascripts files are located in ``cla_frontend/assets/src/javascripts``
and are concatinated into ``cla_frontend/assets/javascripts``. To
compile the javascript files run:

::

    npm run js

Images
~~~~~~

Image are optimised and copied into the ``cla_frontend/assets/images``
folder using gulp. Source images should be stored in
``cla_frontend/assets-src/images``. To optimise and copy images into
assets run:

::

    npm run images


Selelium hub setup
~~~~~~~~~~~~~~~~~~

At the moment protractor 1.8.0 works with selenium hub 2.47.1 . If protractor is updated the selenium hub may need to be updated as well. There is a script to do this in scripts/jenkins which will have to be run as sudo on the selenium-hub instance

install docker and `docker-selenium <https://github.com/SeleniumHQ/docker-selenium>`__ on to an instance or vm

::

    sudo docker run -d -p 4444:4444 -P --name selenium-hub selenium/hub:2.47.1
    sudo docker run -d --name node-chrome --link selenium-hub:hub selenium/node-chrome:2.47.1
    sudo docker run -d --name node-firefox --link selenium-hub:hub selenium/node-firefox:2.47.1


To demo the service
~~~~~~~~~~~~~~~~~~~

::
    docker-compose up

This should start up the backend and frontend with compiled assets. All you need to
do is go to `http://localhost:8001`

Known Issues:
`clabackend` and `db` containers might not be ready first time round so you might have
to stop the docker-compose up and then run it again.
