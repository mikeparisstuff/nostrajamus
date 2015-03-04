__author__ = 'MichaelParis'

from fabric.api import *
from fabric.contrib.console import confirm

env.use_ssh_config = True
env.roledefs = {'web': ['jamus'], 'celery': ['jamus_celery']}
code_dir = "~/nostrajamus"

@roles('web')
def migrate():
    with cd(code_dir):
        with prefix("workon nostrajamus"):
            run("python manage.py migrate")

@roles('celery')
def restart_celery():
    with prefix('workon nostrajamus'):
        run("supervisorctl -c ~/.supervisor/celery.conf restart nostrajamus-celery")

@roles('web')
def restart_web():
    with prefix('workon nostrajamus'):
        run("supervisorctl -c .supervisor/web.conf restart nostrajamus-web")

@roles('web')
def restart_web_beat():
    with prefix('workon nostrajamus'):
        run("supervisorctl -c .supervisor/web.conf restart nostrajamus-celery")

@roles('web')
def deploy_web():
    with settings(warn_only=True):
        if run("test -d %s" % code_dir).failed:
            run("git clone git@github.com:mlp5ab/nostrajamus.git %s" % code_dir)
            with cd(code_dir):
                run('source /usr/local/bin/virtualenvwrapper.sh && mkvirtualenv nostrajamus')
                run("workon nostrajamus && pip install -r requirements.txt")
    with cd(code_dir):
        run("git pull origin")
        with prefix("workon nostrajamus"):
            run("python manage.py collectstatic")
    migrate()
    restart_web()

@roles('celery')
def deploy_celery():
    with settings(warn_only=True):
        if run("test -d %s" % code_dir).failed:
            run("git clone git@github.com:mlp5ab/nostrajamus.git %s" % code_dir)
            with cd(code_dir):
                run('source /usr/local/bin/virtualenvwrapper.sh && mkvirtualenv nostrajamus')
                run("workon nostrajamus && pip install -r requirements.txt")
    with cd(code_dir):
        run("git pull origin")
    restart_celery()