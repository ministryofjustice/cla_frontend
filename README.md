# CLA

Frontend application for the Civil Legal Aid Tool.

## Dependencies

* [Virtualenv](http://www.virtualenv.org/en/latest/)
* [Python](http://www.python.org/) (Can be installed using `brew`)
* [Postgres](http://www.postgresql.org/)

## Installation

Clone the repository:

    git clone git@github.com:ministryofjustice/cla_frontend.git

Next, create the environment and start it up:

    virtualenv env --prompt=\(cla_fe\)

    source env/bin/activate

Install python dependencies:

    pip install -r requirements/local.txt

Start the server:

    ./manage.py runserver 8001

## Dev

Each time you start a new terminal instance you will need to run the following commands to get the server running again:

    source env/bin/activate

    ./manage.py runserver 8001