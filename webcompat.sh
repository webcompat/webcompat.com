#!/bin/sh
sh -c '. env/bin/activate & echo $! >env.pid; python run.py & echo $! >pythonserver.pid'
java -jar selenium-server-standalone-2.44.0.jar & echo $! >selenium.pid
