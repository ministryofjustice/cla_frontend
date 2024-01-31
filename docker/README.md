# Installation

## Dependencies
- [Docker](https://www.docker.com/)

## Installation

Clone the repository:
```
git clone https://github.com/ministryofjustice/cla_frontend/
```
___
To run cla_frontend as a multi-container application with `cla_backend` run:
```
./run_local.sh
```
[!NOTE]
This will install cla_backend at `../cla_backend` if it is not already present.
___ 
To run cla_frontend as a standalone container run:
```
./run_local_standalone.sh
```
[!IMPORTANT]
This requires `cla_backend` to be run as it's own container.
___
`./cla_frontend` is mounted as a volume within in the container as `/home/app/cla_frontend`.

