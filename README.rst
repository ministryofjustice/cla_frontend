CLA Frontend
############

Frontend application for the Civil Legal Aid Tool.

Dependencies
------------

-  `Virtualenv <http://www.virtualenv.org/en/latest/>`__
-  `Python 2.7 <http://www.python.org/>`__ (Can be installed using ``brew``)
-  `nodejs.org <http://nodejs.org/>`__
-  `Sass <http://sass-lang.com/>`__ (Ruby version - minimum v3.3)
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

Install python dependencies:

::

    pip install -r requirements/local.txt

Create a ``local.py`` settings file from the example file:

::

    cp cla_frontend/settings/.example.local.py cla_frontend/settings/local.py

Install Frontend dependencies libraries:

::

    npm install -g bower gulp

Install bower packages:

::

    bower install

Install node packages:

::

    npm install

Compile assets:

::

    gulp build

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

    gulp build

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

    gulp watch

The gulp ``watch`` task allows you to use
`livereload <http://livereload.com/>`__ with this project. The easiest
way to utilise livereload is to:

-  Install the `chrome
   extension <https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en>`__
-  Allow websocket connections locally on CSP (Content Security Policy)
   by adding ``'ws://'`` to ``CSP_DEFAULT_SRC`` in ``local.py``. Full
   example:

``if DEBUG:     CSP_DEFAULT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", 'ajax.googleapis.com', 'data:', 'cdn.ravenjs.com', 'app.getsentry.com', 'ws://')``

-  Run ``gulp watch``
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

    gulp sass

Javascripts
~~~~~~~~~~~

Javascripts files are located in ``cla_frontend/assets/src/javascripts``
and are concatinated into ``cla_frontend/assets/javascripts``. To
compile the javascript files run:

::

    gulp js

Images
~~~~~~

Image are optimised and copied into the ``cla_frontend/assets/images``
folder using gulp. Source images should be stored in
``cla_frontend/assets-src/images``. To optimise and copy images into
assets run:

::

    gulp images

Testing - methods to be obsoleted soon
--------------------------------------

CasperJS is used to run basic functional/browser tests on basic DOM
interactions. To run the tests, make sure you have the following
dependencies:

-  `PhantomJS <http://phantomjs.org/>`__
-  `CasperJS <http://casperjs.org/>`__ (dev version)

To run the tests, use the following make command:

::

    make test

By default, tests will be run on ``http://0.0.0.0:8001/``. To change
this you can pass the ``--url`` argument on the command called in the
make file. To see what command is called look at the ``Makefile`` at the
project root.

Try it on Heroku
----------------

You can deploy directly to Heroku if you want to get started quickly,
just click here: |Deploy|_.

Keep a note of the URL you deployed the backend to, you'll need to provide to
heroku when you deploy this app.

.. |Deploy| image:: https://www.herokucdn.com/deploy/button.png
.. _Deploy: https://heroku.com/deploy

You should now be able to visit your deployed app and be able go log into
the call centre part of the system with the username / password: test_operator / test_operator
and the provider part of the system with the username / password: test_staff/ test_staff
