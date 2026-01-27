# 🏛️ CLA Frontend

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/cla_frontend/badge)](https://github-community.service.justice.gov.uk/repository-standards/cla_frontend)

A frontend (web UI), part of the Civil Legal Advice product.

Used by call centre operators and specialist providers to view and edit information about a case.

## 📋 Overview

Comprises:

- **Angular 1 app** - the presentation layer
- **Django app** - a thin API and auth

This frontend **requires** [cla_backend](https://github.com/ministryofjustice/cla_backend) to be running. The frontend cannot function without it. The backend provides:

- User authentication
- Case data API
- Eligibility checking logic

## 📦 Prerequisites

### 🐳 Docker Desktop

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) on your Mac/Linux machine
2. Ensure you are allocated a Docker licence: log into <https://hub.docker.com/> with Google SSO (optionally in Docker Desktop app you can log in using Docker Hub)

You can check the Docker daemon is running:

```bash
docker info
```

### 📦 Node.js v8.9.x

It's suggested to use `nvm` to install this old version of Node.

1. Install NVM: <https://github.com/nvm-sh/nvm#install--update-script>
2. Install the Node.js version:

   ```bash
   nvm install 8.9
   ```

You can check your Node.js version:

```bash
node --version
```

### 🐍 Pyenv, Python 2

`pyenv` is used to provide Python 2. (Recent macOS versions no longer include Python 2, and Homebrew no longer provides it.)

1. Install pyenv with brew:

   ```bash
   brew install pyenv
   ```

2. Set up your shell for pyenv. Make the changes to `~/.zshrc` described here: [Set up your shell for pyenv](https://github.com/pyenv/pyenv#set-up-your-shell-environment-for-pyenv) (this is so that pyenv's python binary can be found in your path)

3. To make the shell changes take effect:

   ```bash
   exec "$SHELL"
   ```

   (or alternatively, restart your shell)

4. Install into pyenv the Python version this repo uses (which is defined in `.python-version`):

   ```bash
   pyenv install 2.7.18 --skip-existing
   ```

5. Verify your setup:

   ```bash
   docker --version  # Should show Docker 20.x+
   node --version    # Should show v8.9.x
   python --version  # Should show Python 2.7.18
   ```

## 🚀 Installation

> **Note:** It is recommended to use Docker for local development. See [docker/README.md](docker/README.md) for complete Docker installation instructions.

### ⚡ Quick Start (Docker)

```bash
./run_local.sh
# Visit http://localhost:8001
# Login: test_operator / test_operator
```

### 🛠️ Development Setup Overview

You'll need 4 terminal windows running simultaneously:

| Terminal | Process           | Command                               | Port |
| -------- | ----------------- | ------------------------------------- | ---- |
| 1        | Django (Frontend) | `./manage.py runserver 8001`          | 8001 |
| 2        | Socket Server     | `node cla_socketserver/app.js`        | 8005 |
| 3        | Asset Watcher     | `npm run watch`                       | -    |
| 4        | Backend           | `cd ../cla_backend && ./run_local.sh` | 8010 |

### 🔧 Installation using virtualenv

Clone this repository:

```bash
git clone git@github.com:ministryofjustice/cla_frontend.git
```

Ensure you have the right Python version on the path:

```bash
cd cla_frontend
python --version
```

Ensure it reports `Python 2.7.18`. (This should match the version in `.python-version`. If it's not correct, check your pyenv shell setup.)

Update `pip` and install `virtualenv` (in pyenv's Python 2.7.18 environment):

```bash
pip install -U pip
pip install virtualenv
```

Create the Python environment:

```bash
virtualenv -p python2.7 env --prompt=cla_fe
```

Activate the Python environment - Linux and Mac:

```bash
source env/bin/activate
```

or on Windows:

```bash
env\scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements/generated/requirements-dev.txt
```

Create a `local.py` settings file from the example file - on Linux and Mac:

```bash
cp cla_frontend/settings/.example.local.py cla_frontend/settings/local.py
```

or on Windows:

```bash
copy cla_frontend\settings\.example.local.py cla_frontend\settings\local.py
```

Install node packages:

```bash
./npm_git_wrapper.sh
```

> **Note:** We use `npm_git_wrapper.sh` rather than call `npm install` directly. This is a temporary hack due to the older version of node needing particular git settings for npm install to work. Do NOT use `npm install` directly for the time being.

Install bower packages:

```bash
npm run bower
```

Compile assets:

```bash
npm run build
```

Install the Angular app's "socket server" (server-side) packages. Open a 2nd terminal and run:

```bash
cd cla_frontend/cla_socketserver/
npm install
node app.js
```

Leave this running. Return to your **1st terminal**.

Ensure cla_backend is running - see [Running CLA Backend](#running-cla-backend).

Point cla_frontend at cla_backend:

```bash
export BACKEND_BASE_URI=http://localhost:8010
```

You need to set SECRET_KEY. For local development it doesn't need to be secure, so just do:

```bash
export SECRET_KEY=dummy
```

Start the Django server:

```bash
python ./manage.py runserver 8001
```

By default you can sign in with username: `cla_operator` password: `cla_operator`. If you have errors, see: [Troubleshooting](#troubleshooting).

#### Running CLA Backend

It's recommended to use the [docker-compose method of running CLA Backend](https://github.com/ministryofjustice/cla_backend/blob/main/README.md#development-container):

```bash
git clone git@github.com:ministryofjustice/cla_backend.git
cd cla_backend
./run_local.sh
```

You should be able to browse it at: <http://localhost:8010/>

Point cla_frontend at it with:

```bash
export BACKEND_BASE_URI=http://localhost:8010
```

## 🏃 Running the Development Environment

We suggest you should keep 3 terminals (+1 for the backend):

1. Django runserver:

   ```bash
   cd cla_frontend
   source env/bin/activate
   export BACKEND_BASE_URI=http://localhost:8010
   export SECRET_KEY=dummy
   ./manage.py runserver 8001
   ```

2. Socket server:

   ```bash
   cd cla_frontend/cla_socketserver/
   npm install
   node app.js
   ```

3. Gulp watching and compiling the assets:

   ```bash
   cd cla_frontend
   gulp build && gulp watch
   ```

4. Backend:

   ```bash
   cd cla_backend
   ./run_local.sh
   ```

### 🔍 Django Toolbar

If using the Django Toolbar, include the following in your `local.py`:

```python
if DEBUG:
    CSP_DEFAULT_SRC = ("self", "unsafe-inline", "unsafe-eval", 'ajax.googleapis.com', 'data:', 'localhost:8005')
```

### 🎨 Frontend

Assets are managed using [gulp.js](http://gulpjs.com/). To compile the assets once, after a pull for example, run:

```bash
npm run build
```

Any problems with npm which could be resolved by installing all the modules again? Try deleting the `node_modules` directory and running `npm install` again.

## 🧪 Testing

### Unit Testing

```bash
npm test
```

### End-to-End Browser Tests

The browser tests reside in <https://github.com/ministryofjustice/laa-cla-e2e-tests>. Follow the instructions to get these running on your local machine.

If you want to run the tests whilst developing, you'll need to update `docker-compose.yml` from:

```yaml
cla_frontend:
  image: [url_to_remote_image]
```

to something like:

```yaml
cla_frontend:
  build:
    context: ../cla_frontend
```

where the context directory is set to the root of the cla_public directory.

## 💻 Development

When making frequent changes to the assets you can run a gulp watch command to instantly compile any assets. To watch the source assets, leave the following command running in a terminal:

```bash
npm run watch
```

### 🔄 LiveReload

The `watch` task allows you to use [livereload](http://livereload.com/) with this project. The easiest way to utilise livereload is to:

1. Install the [Chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)
2. Allow websocket connections locally on CSP (Content Security Policy) by adding `'ws://'` to `CSP_DEFAULT_SRC` in `local.py`. Full example:

   ```python
   if DEBUG:
       CSP_DEFAULT_SRC = ("self", "unsafe-inline", "unsafe-eval", 'ajax.googleapis.com', 'data:', 'cdn.ravenjs.com', 'app.getsentry.com', 'ws://')
   ```

3. Run `npm run watch`
4. Enable livereload by clicking the icon in Chrome

Now any changes in the assets folder will automatically reload the site in Chrome.

## 🔍 Lint and Pre-Commit Hooks

To lint with Black and flake8, install pre-commit hooks:

```bash
. env/bin/activate
pip install -r requirements/generated/requirements-dev.txt
pre-commit install
```

To run them manually:

```bash
pre-commit run --all-files
```

## 🛠️ Building Individual Parts

### Stylesheets

Stylesheets are located in `cla_frontend/assets-src/stylesheets` and are compiled into `cla_frontend/assets/stylesheets`. They are written in Sass using the `scss` syntax.

To compile the stylesheets run:

```bash
npm run sass
```

### JavaScript

JavaScript files are located in `cla_frontend/assets/src/javascripts` and are concatenated into `cla_frontend/assets/javascripts`. To compile the JavaScript files run:

```bash
npm run js
```

### Images

Images are optimised and copied into the `cla_frontend/assets/images` folder using gulp. Source images should be stored in `cla_frontend/assets-src/images`. To optimise and copy images into assets run:

```bash
npm run images
```

## Troubleshooting

### CSRF Verification Failed

If on Sign In you get "Forbidden. CSRF verification failed", then clear your cookies and start again. It is due to finding cookies from previously running a different Django site on 127.0.0.1. (You can use `localhost` for one to avoid this.)

### Authentication Issues

If on Sign In you get "There was a problem submitting the form. Please enter a correct username and password.", it might also be due to no response on the configured BACKEND_BASE_URI. Check that is configured correctly to point at a working cla_backend instance.

### SECRET_KEY Not Defined

If the application does not run because SECRET_KEY is not defined, then add SECRET_KEY as an environment variable.

### Bad Request (400)

If the application runs but you get a 400 error (Bad request) when using 127.0.0.1:8001 then you will need to update the ALLOWED_HOSTS environment variable.

### Missing Images

If the application runs locally but there are no images then this means that DEBUG is set to False. Add the following line to `local.py` to change it to True:

```python
DEBUG = True
```

## 🎬 Demo the Service

```bash
docker-compose up
```

This should start up the backend and frontend with compiled assets. All you need to do is go to <http://localhost:8001>.

### Known Issues

`clabackend` and `db` containers might not be ready first time round so you might have to stop the docker-compose up and then run it again.

## 🚀 Releasing

### Releasing to Non-Production

1. Wait for [the Docker build to complete on CircleCI](https://circleci.com/gh/ministryofjustice/cla_frontend) for the feature branch
2. Copy the `feature_branch.<sha>` reference from the `build` job's "Push Docker image" step. Example:

   ```text
   Pushing tag for rev [9a77ce2f0e8a] on {https://registry.service.dsd.io/v1/repositories/cla_frontend/tags/dual-docker-registries.902c45d}
   ```

3. [Deploy `feature_branch.<sha>`](https://ci.service.dsd.io/job/DEPLOY-cla_frontend/build?delay=0sec)
   - `tag` is the branch that needs to be released plus a specific 7-character prefix of the Git SHA (e.g., `dual-docker-registries.902c45d` for the above example)
   - `environment` is the target environment, select depending on your needs, e.g., "demo", "staging", etc.
   - `branch` is the [deploy repo's](https://github.com/ministryofjustice/cla_frontend-deploy) default branch name, usually main

### Releasing to Training

1. Please make sure you tested on a non-production environment before merging
2. Merge your feature branch pull request to `main`
3. Wait for [the Docker build to complete on CircleCI](https://circleci.com/gh/ministryofjustice/cla_frontend/tree/main) for the `main` branch
4. Copy the `main.<sha>` reference from the `build` job's "Push Docker image" step. Example:

   ```text
   Pushing tag for rev [d96e0157bdac] on {https://registry.service.dsd.io/v1/repositories/cla_frontend/tags/main.b24490d}
   ```

5. [Deploy `main.<sha>` to **training**](https://ci.service.dsd.io/job/DEPLOY-cla_frontend/build?delay=0sec)

### Releasing to Production

> **⚠️ Warning: Release to production outside of business hours**
>
> **Business hours:** 09:00 to 20:00
>
> **Why?** Any downtime on the frontend and backend between 09:00 and 20:00 can have serious consequences, leading to shut down of the court legal advice centres, possible press reports and maybe MP questions.
>
> **Is there downtime when a release occurs?** Usually it's just a few seconds. However changes that involve Elastic IPs can take a bit longer.

1. Please make sure you tested on a non-production environment before merging
2. Merge your feature branch pull request to `main`
3. Wait for [the Docker build to complete on CircleCI](https://circleci.com/gh/ministryofjustice/cla_frontend/tree/main) for the `main` branch
4. Copy the `main.<sha>` reference from the `build` job's "Push Docker image" step. Example:

   ```text
   Pushing tag for rev [d96e0157bdac] on {https://registry.service.dsd.io/v1/repositories/cla_frontend/tags/main.b24490d}
   ```

5. [Deploy `main.<sha>` to production](https://ci.service.dsd.io/job/DEPLOY-cla_frontend/build?delay=0sec)

## ✅ Verify Installation

1. **Check Backend Connection:**

   ```bash
   curl http://localhost:8010/status.json
   ```

2. **Check Frontend Connection:**

   ```bash
   curl http://localhost:8001/status/live/
   ```

3. **Check Socket Service:**

   ```bash
   curl http://localhost:8005/
   ```

4. **Run Smoke Tests:**

   ```bash
   python manage.py test cla_frontend.apps.status.tests.smoketests
   ```

## ⚙️ Required Environment Variables

| Variable            | Description               | Example                      |
| ------------------- | ------------------------- | ---------------------------- |
| `BACKEND_BASE_URI`  | URL to cla_backend API    | `http://localhost:8010`      |
| `SECRET_KEY`        | Django secret key         | `dummy` (dev only)           |
| `ALLOWED_HOSTS`     | Comma-separated hostnames | `localhost,127.0.0.1`        |
| `DEBUG`             | Enable debug mode         | `True`                       |
| `OS_PLACES_API_KEY` | Ordnance Survey API key   | Required for postcode lookup |

See [cla_frontend/settings/base.py](cla_frontend/settings/base.py) for all configuration options.

### 🔌 Socket Server (Required Component)

The application requires a Socket.IO server for real-time communication between operators. It must run continuously during development.

**In a separate terminal:**

```bash
cd cla_socketserver
npm install
node app.js  # Runs on port 8005
```

Configure the frontend to connect to it by setting:

- `SOCKETIO_SERVER_URL` - External browser URL (default: `http://localhost:8005/socket.io`)
- `SOCKETIO_SERVICE_URL` - Internal service URL (default: `localhost:8005/socket.io/`)

## 🪝 Git Hooks

Repository uses [MoJ DevSecOps hooks](https://github.com/ministryofjustice/devsecops-hooks) to ensure `pre-commit` git hook is evaluated for series of checks before pushing the changes from staging area. Engineers should ensure `pre-commit` hook is configured and activated.

### 📥 Installation

Ensure [prek](https://github.com/j178/prek?tab=readme-ov-file#installation) is installed globally.

Linux / macOS

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://raw.githubusercontent.com/ministryofjustice/devsecops-hooks/e85ca6127808ef407bc1e8ff21efed0bbd32bb1a/prek/prek-installer.sh | sh
```

or

```bash
brew install prek
```

#### Windows

```bash
powershell -ExecutionPolicy ByPass -c "irm https://raw.githubusercontent.com/ministryofjustice/devsecops-hooks/e85ca6127808ef407bc1e8ff21efed0bbd32bb1a/prek/prek-installer.ps1 | iex"
```

### ⚡ Activation

Execute the following command in the repository directory:

```bash
prek install
```

### 🧪 Test

To dry-run the hook:

```bash
prek run
```

### 🔧 Configuration

#### Exclusion List

One can exclude files and directories by adding them to `exclude` property. Exclude property accepts [regular expression](https://pre-commit.com/#regular-expressions).

Ignore everything under `reports` and `docs` directories for `baseline` hook as an example:

```yaml
repos:
  - repo: https://github.com/ministryofjustice/devsecops-hooks
    rev: v1.0.0
    hooks:
      - id: baseline
        exclude: |
          ^reports/|
          ^docs/
```

Or one can also create a file with list of exclusions:

```yaml
repos:
  - repo: https://github.com/ministryofjustice/devsecops-hooks
    rev: v1.0.0
    hooks:
      - id: baseline
        exclude: .pre-commit-ignore
```

---

✨ **Built with ❤️ by the Ministry of Justice**
