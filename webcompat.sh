#!/bin/sh
sh -c '. env/bin/activate & echo $! >env.pid; python run.py & echo $! >pythonserver.pid'
java -jar selenium-server-standalone-2.43.1.jar & echo $! >selenium.pid
