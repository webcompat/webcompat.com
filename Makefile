init:
	echo "❯ Initializing..."
	(pip install virtualenv)
	(virtualenv env)
	sh -c '. env/bin/activate; pip install -r requirements.txt'
	(cp config.py.example config.py)
	@ npm install
	@ grunt

update:
	@ echo "❯ Updating..."
	@ npm update

watch:
	@ echo "❯ Watching..."
	@ grunt watch

dist:
	@ echo "❯ Distribution..."
	@ grunt

start:
	@ echo "❯ Starting..."
	@ sh -c '. env/bin/activate; python run.py'

serv:
	@ echo "❯ Launching server..."
	@ nohup ./webcompat.sh $

run:
	@ node_modules/.bin/intern-runner config=tests/functional/intern

end:
	kill `cat env.pid`
	kill `cat pythonserver.pid`
	kill `cat selenium.pid`
	(rm  nohup.out)
