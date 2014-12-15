install:
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

build:
	@ echo "❯ Building..."
	@ grunt

start:
	@ echo "❯ Starting..."
	@ sh -c '. env/bin/activate; python run.py'
