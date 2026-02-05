FROM python:3.14-slim

# Set environment variables
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=${FLASK_RUN_PORT:-8000}
ENV PYTHONUNBUFFERED=1

# Create a non-root user
RUN adduser --disabled-password app -u 1000 && \
    cp /usr/share/zoneinfo/Europe/London /etc/localtime

RUN mkdir /home/app/sso
WORKDIR /home/app/sso

COPY app.py app_config.py requirementssso.txt .
COPY templates templates
RUN pip install -r requirementssso.txt
RUN mkdir flask_session
RUN chown app:app flask_session
USER app

# Expose the Flask port
EXPOSE $FLASK_RUN_PORT
CMD ["flask", "run"]
