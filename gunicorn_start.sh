#!/bin/bash
set -e
LOGFILE=~/nostrajamuslogs/nostrajamus_web.log
ERRFILE=~/nostrajamuslogs/nostrajamus_web.err
LOGDIR=$(dirname $LOGFILE)
ERRDIR=$(dirname $ERRFILE)
NUM_WORKERS=3
USER=ubuntu
DJANGO_WSGI_MODULE=nostrajamus.wsgi
cd /home/ubuntu/nostrajamus
source ~/.virtualenvs/nostrajamus/bin/activate
test -d $LOGDIR || mkdir -p $LOGDIR
test -d $ERRDIR || mkdir -p $ERRDIR
exec gunicorn --error-logfile=$ERRFILE --log-file=$LOGFILE \
                -w $NUM_WORKERS -b 0.0.0.0:8000 ${DJANGO_WSGI_MODULE}:application
