#!/bin/sh
sh -c '. env/bin/activate & echo $! >env.pid; python run.py & echo $! >pythonserver.pid'
java -jar selenium-server-standalone-2.42.2.jar & echo $! >selenium.pid
